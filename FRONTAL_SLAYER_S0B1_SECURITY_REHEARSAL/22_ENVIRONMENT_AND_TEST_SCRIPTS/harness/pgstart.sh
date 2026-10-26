#!/usr/bin/env bash
# Starts the socket-only local rehearsal cluster if it is not running (no TCP listener).
if ! psql -h /tmp/fsrehearsal_pg1 -U postgres -Atc 'select 1' >/dev/null 2>&1; then
  su postgres -s /bin/bash -c "/usr/lib/postgresql/16/bin/pg_ctl -D /tmp/fsrehearsal_pg1/data -o \"-c listen_addresses='' -c unix_socket_directories=/tmp/fsrehearsal_pg1\" -l /tmp/fsrehearsal_pg1/log.txt start >/dev/null 2>&1"
  sleep 2
fi
psql -h /tmp/fsrehearsal_pg1 -U postgres -Atc "select 'pg up: ' || version()" | cut -c1-40
