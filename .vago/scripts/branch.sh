# Puts the Goal's worktree on a fresh branch for this Ticket, cut from
# vago/<goal>, the Goal's branch, which Vago creates and owns. Safe to run
# again: a worktree already on the Ticket's branch stays there with its work,
# committed or not. From anywhere else, an old branch of the Ticket is
# replaced, and changes left uncommitted make the Step fail.
set -eu

goal="vago/$VAGO_GOAL"
ticket="$VAGO_GOAL/$VAGO_TICKET"

if [ "$(git branch --show-current)" = "$ticket" ]; then
	exit 0
fi

if [ -n "$(git status --porcelain)" ]; then
	echo "The checkout has uncommitted changes. Commit or stash them first."
	exit 1
fi

git switch -C "$ticket" "$goal"
