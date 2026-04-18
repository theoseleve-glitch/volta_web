#!/usr/bin/env bash
# setup-claude-code.sh
# One-shot initialization script for the Volta Drinks Claude Code environment.
# Run this once after cloning the repo.

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
RESET='\033[0m'

ok()   { echo -e "${GREEN}✓${RESET} $1"; }
warn() { echo -e "${YELLOW}!${RESET} $1"; }
err()  { echo -e "${RED}✗${RESET} $1"; }
info() { echo -e "${BLUE}→${RESET} $1"; }

echo ""
echo "⚡ Volta Drinks — Claude Code Setup"
echo "──────────────────────────────────────"
echo ""

# 1. Check prerequisites
info "Checking prerequisites..."

if ! command -v node &>/dev/null; then
  err "Node.js not found. Install from https://nodejs.org (v20+)"
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  err "Node.js v$NODE_VERSION found, need v20+"
  exit 1
fi
ok "Node.js $(node -v)"

if ! command -v git &>/dev/null; then
  err "Git not found"
  exit 1
fi
ok "Git $(git --version | awk '{print $3}')"

if ! command -v shopify &>/dev/null; then
  warn "Shopify CLI not found. Installing..."
  npm install -g @shopify/cli@latest
  ok "Shopify CLI installed"
else
  ok "Shopify CLI $(shopify version | head -1)"
fi

if ! command -v claude &>/dev/null; then
  warn "Claude Code CLI not found. Install from https://code.claude.com"
  warn "Continuing setup — Claude Code will work when installed."
else
  ok "Claude Code $(claude --version 2>/dev/null || echo 'installed')"
fi

if ! command -v jq &>/dev/null; then
  warn "jq not found — hooks will run in degraded mode. Install: brew install jq (mac) / apt install jq (linux)"
fi

echo ""

# 2. Verify directory structure
info "Verifying Claude Code structure..."

REQUIRED_PATHS=(
  "CLAUDE.md"
  ".claude/settings.json"
  ".claude/agents/shopify-reviewer.md"
  ".claude/agents/motion-engineer.md"
  ".claude/agents/a11y-auditor.md"
  ".claude/agents/translator-fr-en.md"
  ".claude/agents/perf-auditor.md"
  ".claude/commands/new-section.md"
  ".claude/commands/audit.md"
  ".claude/commands/translate.md"
  ".claude/commands/ship.md"
  ".claude/commands/mascot.md"
  ".claude/hooks/format-on-save.sh"
  ".claude/hooks/verify-before-stop.sh"
  ".claude/rules/stack-decisions.md"
  ".claude/rules/shopify-conventions.md"
  ".claude/rules/motion-and-perf.md"
  ".claude/rules/accessibility.md"
  ".claude/rules/gotchas.md"
  "docs/BUILD_PLAN.md"
  "docs/BRAND.md"
  "docs/OPEN_QUESTIONS.md"
  "docs/METAFIELDS.md"
  ".gitignore"
  ".shopifyignore"
)

missing=0
for path in "${REQUIRED_PATHS[@]}"; do
  if [ ! -e "$path" ]; then
    err "Missing: $path"
    missing=$((missing+1))
  fi
done

if [ $missing -gt 0 ]; then
  err "$missing files missing. Reinstall the memory package."
  exit 1
fi
ok "All ${#REQUIRED_PATHS[@]} required files present"

echo ""

# 3. Make hooks executable
info "Making hooks executable..."
chmod +x .claude/hooks/*.sh
ok "Hooks executable"

echo ""

# 4. Create local settings if not exists
info "Setting up local settings..."
if [ ! -f ".claude/settings.local.json" ]; then
  if [ -f ".claude/settings.local.json.template" ]; then
    cp .claude/settings.local.json.template .claude/settings.local.json
    ok "Created .claude/settings.local.json from template"
    warn "Edit .claude/settings.local.json and set VOLTA_DEV_THEME_ID"
  else
    warn "No template found — create .claude/settings.local.json manually if needed"
  fi
else
  ok ".claude/settings.local.json already exists (kept)"
fi

echo ""

# 5. Verify gitignore is working
info "Verifying .gitignore..."
if [ -d ".git" ]; then
  if git check-ignore .claude/settings.local.json &>/dev/null; then
    ok ".claude/settings.local.json is gitignored"
  else
    warn ".claude/settings.local.json may not be gitignored — check .gitignore"
  fi

  if git check-ignore config/settings_data.json &>/dev/null; then
    ok "config/settings_data.json is gitignored"
  else
    warn "config/settings_data.json may not be gitignored — critical, check .gitignore"
  fi
else
  warn "Not a git repo yet. Run 'git init' when ready."
fi

echo ""

# 6. Shopify theme validation if we're in a theme
info "Checking if this is a Shopify theme..."
if [ -d "sections" ] && [ -d "snippets" ] && [ -d "layout" ]; then
  ok "Shopify theme structure detected"

  if command -v shopify &>/dev/null; then
    info "Running shopify theme check (may take a moment)..."
    if shopify theme check 2>&1 | tee /tmp/theme-check.log | tail -20; then
      CHECK_ERRORS=$(grep -cE "^\s*\[error\]" /tmp/theme-check.log || echo "0")
      if [ "$CHECK_ERRORS" -eq 0 ]; then
        ok "shopify theme check: clean"
      else
        warn "shopify theme check: $CHECK_ERRORS errors"
      fi
    fi
  fi
else
  info "Not in a Shopify theme directory yet. Run 'shopify theme init' to start."
fi

echo ""

# 7. Optional: install Shopify AI Toolkit
info "Shopify AI Toolkit integration..."
if command -v claude &>/dev/null; then
  read -p "Install Shopify AI Toolkit plugin for Claude Code? [y/N] " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    info "Running: claude plugin install @shopify/ai-toolkit"
    claude plugin install @shopify/ai-toolkit || warn "Plugin install failed — install manually later"
  else
    info "Skipped. Install later with: claude plugin install @shopify/ai-toolkit"
  fi
else
  info "Skipped (Claude Code not installed)"
fi

echo ""
echo "──────────────────────────────────────"
ok "Setup complete"
echo ""
echo "Next steps:"
echo "  1. Edit .claude/settings.local.json — set VOLTA_DEV_THEME_ID"
echo "  2. Authenticate Shopify: shopify auth login"
echo "  3. Start dev: shopify theme dev --store=volta-drinks.myshopify.com"
echo "  4. Start Claude Code: claude"
echo "  5. Read CLAUDE.md and docs/BUILD_PLAN.md"
echo ""
echo "⚡ Ready to ship."
echo ""
