# Marks the PR of vago/<goal>, the Goal's branch, ready for review once every
# Ticket is done: it gets the ready-for-review label and a comment mentioning
# the human `gh` is logged in as. An after_all Step, so it runs again when a
# Ticket added at the Goal's end is done; the comment is posted only once.
#
# Calls to GitHub that fail on the network or the service are tried again.
# Fails, and so leaves the Goal stuck, when a call fails for good, and its
# last line says why.
set -eu

. "$(dirname "$0")/github.sh"

goal="vago/$VAGO_GOAL"
trap 'status=$?; [ "$status" = 0 ] || echo "Marking the PR of $goal ready for review failed."' EXIT

retrying gh label create ready-for-review --force --color 0e8a16 \
	--description "Every Ticket of the Goal is done"
retrying gh pr edit "$goal" --add-label ready-for-review
# A comment, not the body: merge.sh rewrites the body after every Ticket, and
# GitHub notifies a mention only when it's first posted.
ping="@$(retrying gh api user --jq .login) every Ticket of this Goal is done, it's ready for your review."
comments="$(retrying gh pr view "$goal" --json comments --jq '.comments[].body')"
if ! printf '%s\n' "$comments" | grep -qxF "$ping"; then
	retrying gh pr comment "$goal" --body "$ping"
fi
