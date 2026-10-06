# Link debug parser test report

Run:

```bash
node scripts/ci/aio-link-permission-parser.test.mjs
```

Covers:

- Multi-permission JSON extraction
- HTTP 403 detection
- Management API endpoint extraction
- UI catalog mapping (when machine id known)
- Secret sanitization and leak scan
- Unresolved path (no guessed permissions)
