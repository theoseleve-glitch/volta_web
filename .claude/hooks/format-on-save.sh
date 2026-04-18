#!/usr/bin/env bash
# format-on-save.sh
# Runs after Edit or Write tool calls. Formats CSS/JS files with Prettier
# if available, otherwise silently exits. This is the "last 10%" auto-formatter
# that frees Claude from having to produce perfectly-formatted code.

set -euo pipefail

# Read the tool call JSON from stdin (Claude Code passes this)
INPUT=$(cat)

# Extract the file path from the tool call
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null || echo "")

# Exit silently if no file path (some tool calls don't have one)
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only format CSS and JS files in assets/
if [[ "$FILE_PATH" != *"/assets/"* ]]; then
  exit 0
fi

# Only CSS, JS, JSON
case "$FILE_PATH" in
  *.css|*.js|*.json)
    ;;
  *)
    exit 0
    ;;
esac

# Check if prettier is available
if ! command -v npx &>/dev/null; then
  exit 0
fi

# Run prettier with a 3-second timeout; don't block on failure
timeout 3 npx --no-install prettier --write "$FILE_PATH" 2>/dev/null || true

exit 0
