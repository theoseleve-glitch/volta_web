#!/usr/bin/env bash
# verify-before-stop.sh
# Runs when Claude Code is about to stop its turn. Checks for common
# "declared done without verifying" patterns and prompts Claude to verify.
# Exits 0 to allow stop, exits 2 with stderr message to block and nudge.

set -euo pipefail

# Read the transcript hint from stdin
INPUT=$(cat)

# Find the last message content. If Claude wrote something like "done",
# "ready", "complete", "should work" without a verification step, nudge it.
LAST_MSG=$(echo "$INPUT" | jq -r '.transcript_hint // ""' 2>/dev/null || echo "")

# Heuristic: did Claude claim "done" without running any verification?
claims_done=0
did_verify=0

if echo "$LAST_MSG" | grep -qiE "\b(done|ready|complete|should work|all set|finished|looks good)\b"; then
  claims_done=1
fi

if echo "$LAST_MSG" | grep -qE "shopify theme check|lighthouse|axe|pa11y|theme dev"; then
  did_verify=1
fi

# If Claude claimed done but didn't verify, nudge it
if [ "$claims_done" -eq 1 ] && [ "$did_verify" -eq 0 ]; then
  # Exit 2 tells Claude Code to show stderr to Claude and continue
  echo "VERIFICATION NUDGE: You appear to have declared work complete without running verification. Before stopping, run at minimum: \`shopify theme check\`. For UI work, also test in the dev preview. For perf-sensitive work, run a Lighthouse check. If everything passes, you can stop again." >&2
  exit 2
fi

# Otherwise allow stop
exit 0
