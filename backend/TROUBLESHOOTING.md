# Troubleshooting & Known Issues

This document tracks environmental quirks, dependency conflicts, and developer "gotchas" encountered during the development of this project.

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