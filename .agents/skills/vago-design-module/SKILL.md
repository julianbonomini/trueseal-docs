---
name: vago-design-module
description: Module design from A Philosophy of Software Design: design it twice, deep modules, where the seam goes. Use when designing a module or an exported interface, or when approving someone else's design.
---

# Design a module

Design a module, or a change to a module's exported interface, so it is deep: a small, simple interface hiding a lot. The guidance comes from John Ousterhout's *A Philosophy of Software Design*, summarised in [aposd.md](aposd.md). Read that file when a step below doesn't settle a case; the § numbers point into it.

## Designing

1. **Name the knowledge.** Write down what the module hides from everyone else: a file format, a path layout, a protocol, an algorithm. That knowledge is the seam. If two modules would both need it, they're one module, or the knowledge moves into one of them. (§4 information hiding)
2. **Name the common case.** Write the call most callers make. It takes no options; defaults live inside the module. (§2.5, §4 pull complexity downwards)
3. **Design it twice.** Sketch at least two radically different interfaces, two or three lines each: different seams, different splits, different shapes of call. Tweaks of one idea don't count; the first idea is often not the best. (§2.12, §4 design it twice)
4. **Compare them** on each question below, then pick one or combine them.
5. **Write the interface comment first**, before any body: what each export gives back, what the caller must know, what it throws. Nothing about how it works. If the comment is long or hard to write, the design is wrong; go back to step 3. (§4 comments; red flag: Hard to Describe)
6. **Record the choice.** Both options in two or three lines each, which one you picked and why. The PR body carries it when there is a PR.

Done when the module has one chosen interface with its interface comments, and the losing option is written down beside it.

## The questions

- **Is it deep?** Is the interface, counting ordering constraints, side effects and the errors callers must handle, much simpler than what it hides? Many tiny modules each adding interface cost is classitis. (§2.4, §4 deep vs. shallow)
- **Does each decision have one owner?** A data format or layout known in two places is Information Leakage. Exposing internal structures, such as returning a mutable internal array, leaks too. (§4 information hiding)
- **Is it split by knowledge, not by order?** Read, validate and save steps that all know the same schema belong in one module. (red flag: Temporal Decomposition)
- **Is the common case simple?** Rare features stay out of the common call's way. A configuration knob is added only when the caller really knows better than the module. (§2.5; red flag: Overexposure)
- **Is the complexity pulled down?** Unavoidable complexity sits inside the module, not in every caller, when it's close to the module's job and simplifies the system as a whole. A simple interface matters more than a simple implementation. (§2.6, §2.10, §4 pull complexity downwards)
- **Is it somewhat general-purpose?** What is the simplest interface that covers every current need? In how many situations would each function be used? The interface is general enough for several uses while the implementation does only what's needed today. Special-purpose code stays at the edges (top-level commands, output). (§2.7, §2.8, §4 general-purpose vs. special-purpose; red flag: Special-General Mixture)
- **Does each layer change the abstraction?** A layer that looks like its neighbour, a pass-through method or a pass-through variable means a layer isn't earning its place. Fold a wrapper that adds no real function into its caller or the module under it. Duplicating an interface is fine only when each copy adds function, as a dispatcher does. (§2.9, §4 different layer, different abstraction)
- **Together or apart?** Combine code that shares information, is always used together, overlaps in concept or is hard to understand separately. Keep general-purpose code apart from special-purpose code. Length isn't a reason to split: a long function with a simple signature that reads top to bottom is fine, and each function does one thing completely. After a split, each piece is understandable on its own. (§4 better together or better apart; red flag: Conjoined Methods)
- **Are errors and special cases defined out of existence?** Pick semantics where the error can't happen (deleting a missing thing succeeds), mask it low down, aggregate many into one handler higher up, or just crash when it's rare and unrecoverable. The normal path covers special cases without extra branches. Errors the caller must act on stay exposed. (§2.11, §4 define errors out of existence)
- **Can you name it?** A name that is hard to pick, or a description that needs "if X then ... unless Y", means the module is doing two jobs. (§4 naming; red flags: Hard to Pick Name, Hard to Describe)
- **Is it consistent?** Names, interfaces, patterns and invariants match how the rest of the codebase already does it. A better idea isn't worth an inconsistency unless the whole codebase switches. (§4 consistency)
- **Is it an abstraction, not a feature?** Each increment adds an abstraction the next change can build on. It is designed for the reader, not for the writer's speed. Separate what matters from what doesn't, and make what matters prominent. (§2.14 to §2.16)

## Approving a design

Read the design and the code it touches, then ask every question above of it. Check that it was designed twice: two radically different options were written down and compared. Approve only when each question has a good answer. Otherwise name each failing question, where it fails, and the change that fixes it.

Done when every question has an answer, and each failing one names where it fails and its fix.
