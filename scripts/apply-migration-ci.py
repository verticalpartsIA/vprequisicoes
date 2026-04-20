#!/usr/bin/env python3
"""
Aplica supabase/migrations/001_initial_schema.sql via psql.

GitHub Actions (ubuntu-latest) frequentemente não tem rota IPv6 até o host direto
db.<ref>.supabase.co:5432 — o cliente tenta IPv6 e falha com "Network is unreachable".
Este script resolve um endereço IPv4 (A) e usa PGHOST + PGHOSTADDR para o libpq
manter o nome do host no TLS (SNI) e abrir o TCP no IPv4.

Alternativa: configurar o secret SUPABASE_DB_URL com a URI do pooler (Transaction,
porta 6543) em Supabase Dashboard → Project Settings → Database.
"""
from __future__ import annotations

import os
import socket
import subprocess
import sys
from urllib.parse import parse_qs, unquote, urlparse


def main() -> None:
    url = os.environ.get("DATABASE_URL")
    if not url:
        print("::error::DATABASE_URL is not set", file=sys.stderr)
        sys.exit(1)

    u = urlparse(url)
    host = u.hostname
    if not host:
        print("::error::Invalid DATABASE_URL (missing host)", file=sys.stderr)
        sys.exit(1)

    port = u.port or 5432
    user = unquote(u.username or "postgres")
    password = unquote(u.password or "")
    dbname = (u.path or "/postgres").lstrip("/") or "postgres"
    qs = parse_qs(u.query)
    sslmode = (qs.get("sslmode") or ["require"])[0]

    migration = os.environ.get("MIGRATION_FILE", "supabase/migrations/001_initial_schema.sql")
    if not os.path.isfile(migration):
        print(f"::error::Migration file not found: {migration}", file=sys.stderr)
        sys.exit(1)

    try:
        infos = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
    except socket.gaierror as e:
        print(f"::error::DNS failed for {host}: {e}", file=sys.stderr)
        sys.exit(1)

    if not infos:
        print(
            "::error::No IPv4 (A record) for this host. "
            "Use the Transaction pooler connection string (port 6543) from "
            "Supabase Dashboard → Database → Connection string.",
            file=sys.stderr,
        )
        sys.exit(1)

    _fam, _typ, _proto, _canon, sockaddr = infos[0]
    ipv4 = sockaddr[0]

    env = os.environ.copy()
    env["PGHOST"] = host
    env["PGHOSTADDR"] = ipv4
    env["PGPORT"] = str(port)
    env["PGUSER"] = user
    env["PGPASSWORD"] = password
    env["PGDATABASE"] = dbname
    env["PGSSLMODE"] = sslmode

    subprocess.check_call(
        ["psql", "-v", "ON_ERROR_STOP=1", "-f", migration],
        env=env,
    )


if __name__ == "__main__":
    main()
