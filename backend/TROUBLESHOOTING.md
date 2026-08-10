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