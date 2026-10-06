#!/usr/bin/env node
/** Export raw session pooler DSN to GITHUB_ENV (multiline-safe). */
import { exportRawDbUrlToGithubEnv } from './aio-ci-db-url.mjs';

exportRawDbUrlToGithubEnv();
