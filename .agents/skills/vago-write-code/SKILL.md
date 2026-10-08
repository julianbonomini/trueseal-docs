---
name: vago-write-code
description: Code style rules for every line of code in this Project, from A Philosophy of Software Design. Use while writing, editing or refactoring code, comments or tests.
---

# Write code

The rules for every line of code, in any language. They come from John Ousterhout's *A Philosophy of Software Design*, summarised in [aposd.md](../vago-design-module/aposd.md) (kept in the `vago-design-module` skill), and each rule names its source there as a § number. When a case isn't covered here, read that file and decide from it.

The Project's own conventions sit on top of these: its language and tools, its names, which module owns what. They're in the Project's `AGENTS.md` and the docs it names. Follow both.

The goal is **zero complexity added**. Complexity is anything that makes the system harder to understand or change (aposd §1). A change that adds complexity is wrong even when it works.

Done when the change adds no complexity and `vago-check-red-flags` finds nothing in it.

## The test

Before adding anything (a file, an export, a parameter, an option, a type, a branch, a dependency), ask: *does this make the system harder to understand or change?* If the answer is yes or unsure, find the simpler design, or stop and ask the human. Removing code that isn't earning its place is always in scope for the work you're on.

## Design

Designing a module, or changing a module's exported interface, runs the `vago-design-module` skill: it designs it twice and checks the result is deep. Line by line, these hold:

- **Export only what callers need.** Every helper stays private to its module. (§2.4, §4 deep vs. shallow)
- **One owner per decision.** Each file format, path layout and protocol is known by exactly one module. (§4 information hiding)
- **A type lives with the module that owns its concept,** never where it happens to avoid an import cycle. (§4 information hiding; red flag: Information Leakage)
- **An import cycle is a design error.** Fix the direction: make the lower module a leaf that takes plain values, or move the behaviour to the module that owns the concept. If there's no clean fix, stop and ask the human.
- **The common case is the call with no options.** Defaults live inside the module. (§2.5, §4 pull complexity downwards)
- **Define errors out of existence.** Choose semantics where the error can't happen: an idempotent write, an empty list instead of a missing one. (§2.11)
- **Long, obvious functions.** A function reads top to bottom and does one thing completely. Split only when the piece is a real abstraction someone can understand without reading its caller. (§4 better together or apart)
- **General core, special edges.** Code for one command, one case or one integration lives at the edges, never inside a general mechanism. (red flag: Special-General Mixture)

## Code

- **Every value has a real type,** in whatever form the language gives: named fields over tuples and positional arguments, a closed set of values over free strings, data validated where it enters from outside and trusted past that point. A type reads at a glance like documentation of the data; if it needs a second read, write the plain, longer version. (§4 code should be obvious; red flag: Nonobvious Code)
- **State with a lifetime gets an object or a closure that owns it.** Everything else is a plain function. (§4 classitis)
- **Errors.** Outcomes the caller branches on are return values. Bad input the human must fix fails with a message naming the problem and the file. One place at the top catches, reports and picks the exit code. (§4 define errors out of existence: aggregate)
- **Names** say what the thing is, in the Project's domain words, exactly as its glossary spells them. A type is named for the thing it describes and carries its owner's name when it's read far from that module. A name that's hard to pick means the design is wrong. (§4 naming; red flags: Vague Name, Hard to Pick Name)
- **Consistency.** New code looks like the code around it: names, patterns, error handling, file layout. A better idea is worth it only when the whole codebase switches. (§4 consistency)
- **Dependencies** are unknown unknowns (§1). Adding one needs the human's OK.

## Comments

- **Comments inside code explain why:** the reason, the constraint, the trap avoided. The code says what is happening. If a line needs a comment to say what it does, rewrite the line. (red flag: Comment Repeats Code)
- **A field or type comment says only what its name can't.** When a better name would say it, rename instead.
- **Every export has an interface comment:** the contract a caller relies on (what it gives back, what the caller must know, what it fails with), and nothing about how it works. Write it before the body; if it's hard to write, fix the design. (§4 comments; red flags: Hard to Describe, Implementation Documentation Contaminates Interface)
- **Each file opens with two or three lines** saying what the module owns and hides.
- Comments change in the same commit as their code.

## Tests

1. **Design first.** Write the module's exported signatures and interface comments.
2. **Then test first,** one vertical slice at a time, through the highest seam the Project offers. A test describes behaviour a user could see, so it survives any refactor that keeps the behaviour.

The design drives the shape of the code, and the tests check it (§4 where he disagrees with *Clean Code*: TDD).

## Before review

Run the `vago-check-red-flags` skill on your diff and fix every finding before asking anyone to review.
