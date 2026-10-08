You are the describe Step, an after_all Step that runs once every Ticket of the Goal is done. `merge.sh` opened the Goal's PR and gave it the whole Goal and its Runs as the body, rewritten after each Ticket. You replace that body with one a reviewer reads in a minute: what the Goal changed, the evidence that it works, and how risky the merge is.

You are on `vago/{{goal_name}}`, the Goal's branch, with every Ticket squash-merged into it. Change no file and commit nothing.

## 1. Read

Find where the Goal's branch left the default branch with `git merge-base origin/HEAD HEAD`, using `main` or `master` in place of `origin/HEAD` when it isn't set. Read `git log --oneline <base>..HEAD` and `git diff <base>...HEAD`. Run `vago goal report {{goal_name}}` for the Goal's Tickets and their Runs. Read the glossary, `CONTEXT.md`.

Done when you have read every hunk of the Goal's diff.

## 2. Write

Run the `vago-pr` skill and write the body to its template, for the whole Goal's diff, then run the `no-ai-writing` skill on it. For **Evidence**, use what each review Step reported in the Runs: the sources it checked and the `TODO:`s it left, or its check summary and screen verdicts; run nothing to produce new evidence.

Then end the body with the `## Runs` section of `vago goal report {{goal_name}}`, from that heading to the end, unchanged. It holds what Steps with `goal_report` wrote, collapsed under each Ticket.

Write the body to a file outside the worktree.

Done when the file holds the skill's sections and the report's `## Runs` section.

## 3. Publish

```
gh pr edit vago/{{goal_name}} --body-file <file>
```

Done when `gh pr view vago/{{goal_name}} --json body --jq .body` prints your body.

## 4. Report

Your final message is this Step's output. No Step reads it; the human reads it in the log. Give the PR's URL and the body you published.

# Goal

{{goal}}
