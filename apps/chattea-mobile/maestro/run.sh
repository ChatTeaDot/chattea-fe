#!/usr/bin/env bash
set -euo pipefail

HERE=$(cd "$(dirname "$0")" && pwd)
MAESTRO=${MAESTRO_BIN:-$HOME/.maestro/bin/maestro}

"$MAESTRO" test ${MAESTRO_DEVICE:+--device "$MAESTRO_DEVICE"} "$HERE" "$@"
LATEST=$(ls -td "$HOME"/.maestro/tests/*/ 2>/dev/null | head -1)
if [ -n "$LATEST" ]; then
  DEST="$HERE/output/$(basename "${LATEST%/}")"
  rm -rf "$DEST"
  mkdir -p "$DEST"
  cp -R "$LATEST"/. "$DEST/"
  echo "artifacts -> $DEST"
fi
