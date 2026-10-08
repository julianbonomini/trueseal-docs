---
name: vago-check-red-flags
description: Red-flag review from A Philosophy of Software Design. Use on a diff before a commit, a report or a review verdict, on someone else's change before approving it, or on the whole codebase when asked.
---

# Check red flags

Review code against the red flags of John Ousterhout's *A Philosophy of Software Design* and say what to fix. Every red flag is complexity added, and any finding blocks the change until it's fixed.

## Steps

1. **Pick the scope.** Review the diff you were given. With none named, review the current branch against the branch it came from, plus uncommitted changes. When asked for the whole codebase, review every source file.
2. **Read beyond the hunk.** For each file in scope, read the whole module and the callers and callees the code in scope touches. Information Leakage, Repetition, Pass-Through Method and Conjoined Methods only show when you see the other side, so search the codebase for the same knowledge, the same code and the same signature.
3. **Check every red flag below against every module, export, function, name and comment in scope.** Also check every exported type: does its module own the concept the type names? A type kept somewhere else, for example to avoid an import cycle, is Information Leakage.
4. **Report.** One finding per line: `path:line`, the red flag, what is wrong, and the fix. The fix names the change (merge these modules, inline this wrapper, rename to `x`), not "consider improving". Finish with the files you checked. With no findings, say so.

Done when every file in scope has been checked against every red flag. If you wrote the code, fix each finding and run the check again.

When a finding's fix isn't clear, read the matching chapter in §4 of [aposd.md](../vago-design-module/aposd.md), the book summary kept in the `vago-design-module` skill.

## Red flags

| Red flag | Meaning | What it looks like |
|---|---|---|
| **Shallow Module** | The interface isn't much simpler than the implementation. | A `FileWrapper` whose one method calls the file library's read, or a three-line exported function that takes four options. |
| **Information Leakage** | One design decision shows up in several modules. | Two modules each parse the same file format, or both know the same folder layout. |
| **Temporal Decomposition** | Code is split by the order things run, not by what knowledge they hide. | `read_config`, `validate_config` and `save_config` modules that all know the config's schema. |
| **Overexposure** | To use the common feature you have to learn about rare ones. | `run(cmd, retries, shell, env, cwd, encoding, timeout)` with no defaults, so every call site fills them in. |
| **Pass-Through Method** | A method does little except forward to another with a similar signature. | `get_status(id)` that only returns `store.get_status(id)`, repeated across layers. |
| **Repetition** | The same nontrivial code appears in several places. | The same parse, catch and shape check copied into each command. |
| **Special-General Mixture** | A general mechanism contains code for one particular use. | A general `run_step()` with a branch for `step.id == "review"` inside it. |
| **Conjoined Methods** | You can't understand one method without reading another. | `prepare()` sets module state and `finish()` silently depends on it, so callers must pair them correctly. |
| **Comment Repeats Code** | All of the comment's information is obvious from the adjacent code. | "increment i" above `i += 1`, or "Gets the name" on `get_name()`. |
| **Implementation Documentation Contaminates Interface** | The interface comment describes internals callers don't need. | The doc comment on an exported function explains which map it caches into and the loop order. |
| **Vague Name** | A name broad enough to mean different things. | `data`, `info`, `result`, `handle()`, `manager`, a `utils` module. |
| **Hard to Pick Name** | You can't find a precise, intuitive name for an entity. | You're stuck choosing between `process_and_save_or_skip` and `do_stuff`. The entity is doing two jobs. |
| **Hard to Describe** | A complete interface comment has to be long. | The doc comment needs "if X then ... unless Y, in which case ..." to be accurate. |
| **Nonobvious Code** | You can't understand the behaviour or meaning from a quick read. | A magic `exit_code == 3`, a positional boolean in `run(t, true, false)`, an untyped value flowing through, a tuple read back by position. |
| **Adjacent Layers, Similar Abstractions** | Two layers next to each other offer nearly the same abstraction, so one isn't earning its place. | A service whose methods mirror the store under it one for one. |
| **Pass-Through Variable** | A value is threaded through several functions that don't use it, only to reach one that does. | `cwd` passed through three layers so the bottom one can start a process. |
