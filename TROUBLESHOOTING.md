# Troubleshooting & Known Issues

This document tracks environmental quirks, dependency conflicts, and developer "gotchas" encountered during the development of this project.

## Backend: 

### 1. The `tsx` Loader vs. Node 18 Watch Mode Crash
* **Symptom:** Running `npm run dev` causes the server to crash with `ERR_UNKNOWN_FILE_EXTENSION` or `--loader is deprecated` warnings.
* **Root Cause:** A conflict between Node 18's native experimental watch mode and older versions of the `tsx` CLI tool.
* **Solution:** Bypass the `tsx` CLI entirely and use Node's native import flag. Update the `dev` script in `package.json` to: `"dev": "node --import tsx --watch src/index.ts"`. (Ensure `tsx` is updated to the latest version).

### 2. Node.js `uuid` Module Compatibility
* **Symptom:** Registration endpoint throws a 500 Internal Server Error: `crypto is not defined`.
* **Root Cause:** Version 11+ of the NPM `uuid` package requires Node 19+, which has a globally available `crypto` object. Node 18 does not have this globally exposed by default.
* **Solution:** Dropped the third-party `uuid` dependency entirely. Switched to Node's built-in native crypto module (`import crypto from 'crypto';` -> `crypto.randomUUID()`), improving security and reducing the dependency tree.

### 3. PowerShell `curl.exe` JSON Parsing Errors
* **Symptom:** Testing endpoints with `curl.exe` in Windows PowerShell returns `INTERNAL_ERROR: Unexpected token \ in JSON`.
* **Root Cause:** PowerShell aggressively strips double-quotes from JSON payloads before passing them to the external `curl` C-program, mangling the request body.
* **Solution:** Use native PowerShell cmdlets (`Invoke-RestMethod`) for manual API testing instead of `curl.exe`. 
  * *Tip:* Append `| ConvertTo-Json -Depth 5` to the command to prevent PowerShell from collapsing nested JSON objects (like tokens) into `@{}` placeholders.

  ## Issue 3: Testing File Uploads & Express Middleware

### 1. Supertest dropping file extensions with Multer
**Symptom:** Tests using `supertest` with `.attach('file', Buffer.from('code'), 'test.js')` fail Multer's strict file extension validation, throwing `Invalid file type` errors despite the filename being technically correct.
**Cause:** When using `Buffer.from()` in-memory, `supertest` can sometimes drop or mangle the `originalname` property. Multer relies on this property to check the extension via `path.extname()`.
**Solution:** Pass a complete options object to the attach method to explicitly define the filename: `.attach('file', Buffer.from('code'), { filename: 'test.js' })`.

### 2. Global Rate Limiter failing parallel test suites
**Symptom:** Running the full Jest suite (`npm test`) results in cascading, random test failures (often throwing `401 Unauthorized` or `429 Too Many Requests`), but running test files individually yields a 100% pass rate.
**Cause:** Jest runs test files in parallel. `express-rate-limit` tracks requests by IP. Local tests all originate from `127.0.0.1`. Firing dozens of mock auth and upload requests simultaneously triggers the DDoS protection and bans the testing environment's IP.
**Solution:** Configure `express-rate-limit` to bypass checks when in the testing environment by adding `skip: () => process.env.NODE_ENV === 'test'` to the limiter options in `app.ts`.

### 3. Test State Leakage in In-Memory Datastores
**Symptom:** Backend service tests fail on simple counts (e.g., `Expected: 2, Received: 16`), despite the specific `describe` block only creating 2 records.
**Cause:** The service layer uses a persistent in-memory Map or Array to store data. Because Jest maintains the Node process during the test run, data from earlier test blocks remains in memory, polluting later assertions.
**Solution:** Create a testing-only teardown method in the service (e.g., `clearAll()`) that empties the datastore, and call it inside a `beforeEach()` block in the test file. Ensure this method is heavily gated by `if (process.env.NODE_ENV === 'test')`.

### 4. Timestamp Race Conditions
**Symptom:** Tests asserting that an `updatedAt` timestamp is `toBeGreaterThan` a `createdAt` timestamp fail randomly, reporting both timestamps as identical.
**Cause:** Modern processors execute the object creation and subsequent status update within the exact same millisecond. Furthermore, if the test queries the object by reference rather than value, updating the status modifies the original object in place.
**Solution:** In the test, capture the initial state. Manually manipulate the initial object's timestamp 1 second into the past (`pastTime.setSeconds(pastTime.getSeconds() - 1)`), convert it back using `.toISOString()`, and save it to an immutable primitive string variable *before* executing the backend update logic.

## Issue 4: Code Extraction Engine (Babel AST)

### 1. Babel TypeScript Type Definitions (Strict Mode Errors)
**Symptom:** Compiling AST helper functions throws errors like `Property 'typeAnnotation' does not exist on type 'Identifier'` or `TS6133: 'context' is declared but its value is never read`.
**Cause:** The `@babel/types` package definitions are highly strict. Babel is primarily a JavaScript tool, so when analyzing TypeScript, its type definitions don't natively anticipate TypeScript-specific nodes like `typeAnnotation` on standard JS identifiers. Additionally, strict TS configuration throws errors on unused method parameters.
**Solution:** 
1. Use type assertion `(node as any)` temporarily when extracting TypeScript-specific properties from Babel nodes to satisfy the compiler.
2. Prefix intentionally unused variables with an underscore (e.g., `_context`, `_params`) to signal to the TypeScript compiler that the omission is deliberate.

### 2. Babel Deprecation Warnings in Terminal
**Symptom:** The development server logs output a yellow warning: `` `isNumberLiteral` has been deprecated, please migrate to `isNumericLiteral` ``.
**Cause:** A recent update to the Babel ecosystem renamed the validator method for numbers. 
**Solution:** Update any AST traversal conditions checking for numbers from `t.isNumberLiteral(node)` to `t.isNumericLiteral(node)`.

### 3. API Response Race Conditions (Failing Upload Tests)
**Symptom:** Tests expecting an extraction status of `"processing"` fail because they receive `"completed"`, or export tests fail because results are available instantly.
**Cause:** The API controller was synchronously `await`ing the heavy AST processing logic to finish before returning a response to the user. This effectively froze the server, causing the file to finish extracting entirely before the initial HTTP `201 Created` response was ever sent.
**Solution:** Implement the extraction as a "fire-and-forget" background task. Remove the `await` keyword from the actual execution call (`CodeExtractionController.processExtraction(id).catch(...)`) so the server instantly returns the `processing` status while the heavy lifting happens behind the scenes. *Note: You must still keep the `await` on the dynamic import (`await import(...)`) so the module loads into memory before execution.*

## Issue 5: PostgreSQL Database Setup (Knex.js)

### 1. TypeScript vs. Node.js ESM Import Clashes (Knex)
**Symptom:** The IDE throws `This expression is not callable` on `knex()`, OR the terminal throws `SyntaxError: The requested module 'knex' does not provide an export named 'knex'` when running the app.
**Cause:** Node.js runtime and TypeScript module resolution disagree on how to handle the Knex.js package in an ESM environment. Knex exports a default module, but strict TypeScript definitions struggle to type it correctly without named imports, causing a catch-22.
**Solution:** Import the default export and the Types separately, then use a double-cast to force TypeScript to recognize the default export as a callable function. Do this by importing `knexSetup` from `knex` as well as importing `type { Knex }` from `knex`, and then defining your `knex` constant as `knexSetup` cast to `unknown` and then cast to the `Knex` config function type.

### 2. Knex Pool Configuration Types
**Symptom:** `Object literal may only specify known properties, and 'connectionTimeoutMillis' does not exist in type 'PoolConfig'.`
**Cause:** AI code generators often mix up raw PostgreSQL driver configurations (`pg`) with Knex's internal connection pool manager configuration. 
**Solution:** Remove `connectionTimeoutMillis` from the `pool: {}` block in `database.ts`. Knex handles timeouts using its own internal defaults.

### 3. PostgreSQL UUID Strictness in Tests
**Symptom:** Database integration tests instantly fail with a PostgreSQL error: `invalid input syntax for type uuid`.
**Cause:** SQLite or MySQL will often forgive invalid strings in ID columns, but PostgreSQL enforces strict validation. Mock IDs like `'test-user-1'` will cause fatal database rejections.
**Solution:** Ensure all mock data in Jest test files and seed files use properly formatted 36-character UUID strings (e.g., `'11111111-1111-1111-1111-111111111111'`).

### 4. Knex Update Return Types (PostgreSQL Specific)
**Symptom:** TypeScript throws `Element implicitly has an 'any' type... Property '0' does not exist on type 'Number'` or complains about double casting.
**Cause:** By default, Knex assumes an `.update()` call returns a `number` (the count of affected rows). However, in PostgreSQL, appending `.returning('*')` or `['*']` forces the database to return an array of the actual updated row objects. TypeScript's strict mode rejects treating a `number` like an `array`.
**Solution:** Use a TypeScript double-cast (appending `as unknown as any[]` to the end of the database call) to override the Knex definition and assert that the return value is an array.

### 5. PostgreSQL count() String Return
**Symptom:** Aggregation methods like `.count()` return strings instead of numbers, causing type mismatches when returning data to the client.
**Cause:** To prevent overflowing JavaScript's maximum safe integer limit, the PostgreSQL driver automatically casts `COUNT()` results to BigInt strings (e.g., `"5"` instead of `5`).
**Solution:** Manually parse the string back into an integer using `parseInt()` when mapping the database result back to the application's repository types.

## Frontend: 

## Issue 6 (React/Vite 8) Setup & Node 24 Quirks

During the initialization of the React frontend (Issue #6), we encountered several environment and build-time issues related to Vite 8 and Node.js versions.

### 1. Vite 8 / Node 18 Incompatibility (`styleText` error)
* **Symptom:** Running `npm run dev` crashed with `SyntaxError: The requested module 'node:util' does not provide an export named 'styleText'`.
* **Cause:** Vite 8 and its dependencies utilize Node features only available in Node 20+. The system was running Node 18 (EOL).
* **Fix:** Upgraded the system runtime to Node 24 (LTS).

### 2. TypeScript Flagging CSS Imports
* **Symptom:** TypeScript threw errors like `Cannot find module './index.css'` inside `main.tsx`.
* **Cause:** Strict TypeScript does not understand CSS file imports natively without Vite's client type definitions.
* **Fix:** Created `frontend/src/vite-env.d.ts` and added `/// <reference types="vite/client" />`.

### 3. VS Code Unknown At-Rules (`@tailwind`, `@apply`)
* **Symptom:** VS Code's built-in CSS linter flagged Tailwind directives as errors.
* **Fix:** Added `.vscode/settings.json` with `"css.lint.unknownAtRules": "ignore"`.

### 4. LightningCSS Minifier Crash (`"ES2020"`)
* **Symptom:** Running `npm run build` failed with `Error: [lightningcss minify] Unsupported target "ES2020"`.
* **Cause:** Vite's new CSS minifier is strictly case-sensitive and crashes on uppercase target names generated by default TypeScript configs.
* **Fix:** Updated `tsconfig.json` and `vite.config.ts` build targets to lowercase `"es2022"`.

### 5. Native Config Loader Warning (`__dirname`)
* **Symptom:** Vite warned about `__dirname` being unsupported by `configLoader: 'native'`.
* **Fix:** Replaced the legacy `__dirname` with modern Node 24 syntax `import.meta.dirname` in `vite.config.ts`.

### 6. Missing Terser Minifier
* **Symptom:** `npm run build` failed with `Error: terser not found`.
* **Cause:** Terser is no longer bundled by default in newer Vite versions.
* **Fix:** Ran `npm install -D terser` to install it as a dev dependency.

## Issue #7 Authentication UI & Routing Quirks

During the implementation of our authentication flows, we resolved a few specific quirks related to module resolution, TypeScript strictness, and testing secured routes.

### 1. Module Resolution with `.js` Import Extensions
* **Symptom:** TypeScript throws `Cannot find module` errors on local imports (e.g., `import apiClient from './api.js'`).
* **Cause:** Local imports included `.js` file extensions, which disrupts module resolution in our current Vite/TypeScript environment.
* **Fix:** Removed `.js` extensions from all local TypeScript imports (e.g., `import apiClient from './api';`).

### 2. Global Type Mismatches (`User` interface)
* **Symptom:** Forms throw TS Error `2345`: `Property 'createdAt' is missing in type...` when passing a user object to the Zustand store.
* **Cause:** A partial, duplicate definition of the User shape was created inside `AuthResponse`, missing required fields (like `createdAt`) defined in the master `User` type.
* **Fix:** Enforced the DRY principle by importing and using the master `User` type from `types/index.ts` inside the `AuthResponse` interface.

### 3. Tests Failing on `<App />` Render
* **Symptom:** `App.test.tsx` fails with `Unable to find an element with the text: /Welcome to Parsnipt/i`.
* **Cause:** The implementation of `ProtectedRoute` successfully restricted unauthenticated access, immediately redirecting the test runner away from the Home page to the Login page.
* **Fix:** Updated the assertions in `App.test.tsx` to expect the text from the Login page (`/Extract code smarter/i`) instead of the Home page to reflect the new default routing behavior.

## Issue 9 Results Display & Monaco Editor

During the implementation of the code preview interface, we had to handle environment limitations regarding heavy third-party browser components in our test suite.

### 1. Monaco Editor Crashing jsdom
* **Symptom:** Tests rendering the `CodePreview` component crash Vitest immediately because `jsdom` lacks the complex web APIs required to render the full Monaco Editor.
* **Cause:** `@monaco-editor/react` tries to mount real browser-based text editing engine nodes that don't exist in a headless Node environment.
* **Fix:** Utilized `vi.mock()` at the top of the test file to intercept imports of `@monaco-editor/react` and replace them with a simple, safe `<div>` dummy component during test execution.