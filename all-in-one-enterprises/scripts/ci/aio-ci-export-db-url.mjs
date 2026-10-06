#!/usr/bin/env node
/** Export percent-encoded session pooler URL for Supabase CLI --db-url (GitHub ENV only). */
import { exportEncodedDbUrlToGithubEnv } from './aio-ci-db-transport.mjs';

exportEncodedDbUrlToGithubEnv();
