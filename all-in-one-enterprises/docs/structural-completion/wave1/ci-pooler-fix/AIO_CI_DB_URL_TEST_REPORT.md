# DB URL test report

```bash
node scripts/ci/aio-ci-db-url.test.mjs
node scripts/ci/aio-ci-db-transport.test.mjs
node scripts/ci/aio-ci-db.test.mjs
```

Covers raw scheme, password reserved chars, full-URI rejection, direct host, port 6543, sanitized logs.
