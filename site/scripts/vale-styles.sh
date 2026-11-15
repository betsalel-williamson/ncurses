#!/bin/sh
# Fetch the released MerlonDocs Vale style into docs/styles/MerlonDocs, which docs/.vale.ini uses.
# The style comes from the @merlon-docs/merlon-docs-presets package on npm, pinned by version and
# checksum, so CI and a local run lint with the same rules. Run from the repository root.
set -eu
VERSION=1.2.0
SHA256=3af30e329452942e06e4dcdc87b26ea5acb84931fb10ee3e0ac7d01de792730b
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
curl -sSLo "$tmp/presets.tgz" "https://registry.npmjs.org/@merlon-docs/merlon-docs-presets/-/merlon-docs-presets-${VERSION}.tgz"
echo "${SHA256}  $tmp/presets.tgz" | sha256sum -c - >/dev/null
tar -xzf "$tmp/presets.tgz" -C "$tmp" package/vale/MerlonDocs
rm -rf docs/styles/MerlonDocs
mkdir -p docs/styles
cp -r "$tmp/package/vale/MerlonDocs" docs/styles/MerlonDocs
echo "MerlonDocs ${VERSION} in docs/styles/MerlonDocs"
