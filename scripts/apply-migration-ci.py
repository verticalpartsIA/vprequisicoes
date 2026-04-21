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
    url = os.environ.get("DATABASE_URL", "").strip()
    if not url:
        print("::error::DATABASE_URL is not set", file=sys.stderr)
        sys.exit(1)

    migration = os.environ.get("MIGRATION_FILE", "supabase/migrations/001_initial_schema.sql")
    if not os.path.isfile(migration):
        print(f"::error::Migration file not found: {migration}", file=sys.stderr)
        sys.exit(1)

    print(f"Applying migration: {migration}")
    
    # Executa psql diretamente usando a URL de conexão
    # Isso permite que o psql lide com DNS, IPv4/IPv6 e SNI (necessário para o Pooler)
    try:
        subprocess.check_call(
            ["psql", "-v", "ON_ERROR_STOP=1", "-d", url, "-f", migration]
        )
    except subprocess.CalledProcessError as e:
        print(f"::error::psql failed with exit code {e.returncode}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
