#!/usr/bin/env bash
#
# window-process.sh <pane_pid>
#
# Prints the middle segment of a window's status entry based on what is
# running in that window:
#
#   " ❯ "          -> nothing notable running   (renders "1 ❯ name")
#   " ❯ claude: "  -> a recognized program runs (renders "1 ❯ claude: name")
#
# It walks the pane's process subtree (the shell plus all its descendants)
# and matches their command lines against the table below; the first match
# wins. Add your own programs to `matchers` as "regex:::label" entries.

set -uo pipefail

root="${1:-}"
plain=" ❯ "

[ -n "$root" ] || { printf '%s' "$plain"; exit 0; }

# regex (matched case-insensitively against full command lines) ::: label
matchers=(
  'claude-code|@anthropic-ai/claude|(^|/| )claude([[:space:]]|$):::claude'
)

# Command lines of the pane process and every descendant, one per line.
tree=$(ps -eo pid=,ppid=,args= 2>/dev/null) || { printf '%s' "$plain"; exit 0; }

cmds=$(printf '%s\n' "$tree" | awk -v root="$root" '
  { pid=$1; ppid=$2; $1=""; $2=""; sub(/^[[:space:]]+/, ""); args[pid]=$0; parent[pid]=ppid }
  END {
    want[root]=1
    changed=1
    while (changed) {
      changed=0
      for (p in parent)
        if (!(p in want) && (parent[p] in want)) { want[p]=1; changed=1 }
    }
    for (p in want) if (p in args) print args[p]
  }
')

lower=$(printf '%s\n' "$cmds" | tr '[:upper:]' '[:lower:]')

for m in "${matchers[@]}"; do
  pat="${m%%:::*}"
  label="${m##*:::}"
  if printf '%s\n' "$lower" | grep -qiE "$pat"; then
    printf ' ❯ %s: ' "$label"
    exit 0
  fi
done

printf '%s' "$plain"
