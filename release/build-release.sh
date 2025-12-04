#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASE_DIR="$ROOT_DIR/release"
LIGHT_DIR="$RELEASE_DIR/light"
FULL_DIR="$RELEASE_DIR/full"
EXE_DIR="$RELEASE_DIR/exe"
APP_NAME="Enterprise CRM"

rm -rf "$LIGHT_DIR" "$FULL_DIR" "$EXE_DIR" "$RELEASE_DIR/light.zip" "$RELEASE_DIR/full.zip"
mkdir -p "$LIGHT_DIR" "$FULL_DIR"

# Build and stage light (vanilla) version
cp "$ROOT_DIR/index.html" "$LIGHT_DIR/"
[ -f "$ROOT_DIR/crm.html" ] && cp "$ROOT_DIR/crm.html" "$LIGHT_DIR/"
[ -d "$ROOT_DIR/css" ] && cp -R "$ROOT_DIR/css" "$LIGHT_DIR/"
[ -d "$ROOT_DIR/js" ] && cp -R "$ROOT_DIR/js" "$LIGHT_DIR/"
[ -d "$ROOT_DIR/assets" ] && cp -R "$ROOT_DIR/assets" "$LIGHT_DIR/"

# Build and stage full (React) version
pushd "$ROOT_DIR/crm-react" >/dev/null
npm install >/dev/null
npm run build >/dev/null
popd >/dev/null

rsync -a "$ROOT_DIR/crm-react/dist/" "$FULL_DIR/"

# Wrap the full build in a Windows executable (Nativefier)
npx nativefier "file://$FULL_DIR/index.html" \
  --name "$APP_NAME" \
  --platform windows \
  --arch x64 \
  --out "$EXE_DIR" >/dev/null

# Zip artifacts for easy distribution
pushd "$RELEASE_DIR" >/dev/null
zip -rq "light.zip" "light"
zip -rq "full.zip" "full"
popd >/dev/null

echo "Release artifacts generated:"
echo " - $LIGHT_DIR (and light.zip)"
echo " - $FULL_DIR (and full.zip)"
echo " - $EXE_DIR (Nativefier Windows bundle)"
