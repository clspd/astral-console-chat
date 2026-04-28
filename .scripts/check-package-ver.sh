#!/usr/bin/env bash
set -e

P_VER=$(jq -r .version package.json)

# Check pnpm lockfile
if [ -f "pnpm-lock.yaml" ]; then
    if pnpm install --frozen-lockfile 2>&1; then
        exit 0
    else
        echo "Fatal: Package lock file is NOT up to date!! Please check your commit and consider amend it." >&2
        exit 1
    fi
fi

echo "Fatal: Package lock file NOT found!! Please check your commit and consider amend it." >&2
exit 1
