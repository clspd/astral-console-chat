#!/usr/bin/env bash
set -euo pipefail

REPO="${GITHUB_REPOSITORY:?}"
SHA="${GITHUB_SHA:?}"
TOKEN="${GITHUB_TOKEN:?}"
REF_NAME="${GITHUB_REF_NAME:?}"
WORKFLOW_FILE="${BUILD_WORKFLOW_FILE:-build-server.yml}"

TAG_NAME="${REF_NAME#v}"
NPM_DIST_TAG="latest"

if [[ "$TAG_NAME" == *-* ]]; then
  prerelease="${TAG_NAME#*-}"
  NPM_DIST_TAG="${prerelease%%.*}"
fi

echo "npm_dist_tag=$NPM_DIST_TAG"
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "npm_dist_tag=$NPM_DIST_TAG" >> "$GITHUB_OUTPUT"
fi
