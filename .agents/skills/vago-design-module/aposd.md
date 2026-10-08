# A Philosophy of Software Design

The design reference for this Project's code. It summarises John Ousterhout's *A Philosophy of Software Design* (2nd ed.). The `vago-write-code` skill turns it into rules for code, `vago-check-red-flags` checks code against its red flags, and `vago-design-module` applies it to designs. When a rule doesn't settle a case, decide from this file.

It's paraphrase unless text is in quotation marks. Quoted text is either a list-item title from the book's summaries or a phrase confirmed in a source below.

## Sources

- [S1] Ousterhout's book page: https://web.stanford.edu/~ouster/cgi-bin/aposd.php
  (2nd ed., July 2021. It adds the chapter "Decide What Matters", reworks ch. 6
  "General-Purpose Modules are Deeper", and adds comparisons with *Clean Code*.)
- [S2] Ousterhout vs. Robert Martin discussion: https://github.com/johnousterhout/aposd-vs-clean-code
- [S3] Talk, "A Philosophy of Software Design", Talks at Google (2018): https://www.youtube.com/watch?v=bmSAYlu0NcY
- [S4] Secondary notes reproducing the book's summary lists:
  https://lectures.alex.balgavy.eu/softdesign-notes/philosophy-of-software-design/ ,
  https://linghao.io/notes/a-philosophy-of-software-design ,
  https://danlebrero.com/2021/02/24/philosophy-of-software-design-summary/

## 1. What complexity is (ch. 2)

Complexity is anything about a system's structure that makes it hard to understand or modify. Readers judge it, not writers: if others find your code complex, it is complex. [S2, S3]

Three symptoms:
- **Change amplification.** A simple change needs edits in many places.
- **Cognitive load.** How much a developer must know to finish a task. More lines can sometimes mean less load.
- **Unknown unknowns.** It isn't clear which code must change, or what you need to know to change it safely. Ousterhout ranks this as the worst of the three.

Two causes:
- **Dependencies.** A piece of code can't be understood or changed on its own.
- **Obscurity.** Important information isn't obvious: vague names, undocumented invariants, hidden coupling.

Complexity is incremental. It builds up from many small choices, and no single one looks fatal. That's why the book asks for "zero tolerance" toward it. [S4]

## 2. Design principles (the book's closing summary)

1. **Complexity is incremental.** You have to sweat the small stuff.
2. **Working code isn't enough.** Don't add complexity just to finish faster.
3. **Make continual small investments to improve system design.**
4. **Modules should be deep.** Powerful functionality behind a simple interface.
5. **Interfaces should be designed to make the most common usage as simple as possible.**
6. **It's more important for a module to have a simple interface than a simple implementation.**
7. **General-purpose modules are deeper.**
8. **Separate general-purpose and special-purpose code.**
9. **Different layers should have different abstractions.**
10. **Pull complexity downward.** Make life easy for the caller, even if the module's internals get harder.
11. **Define errors (and special cases) out of existence.**
12. **Design it twice.** Consider at least two radically different options for each major decision.
13. **Comments should describe things that are not obvious from the code.**
14. **Software should be designed for ease of reading, not ease of writing.**
15. **The increments of software development should be abstractions, not features.**
16. **Decide what matters.** Separate what matters from what doesn't, and make the things that matter prominent. (2nd-ed. chapter [S1].)

## 3. Red flags (the book's closing summary)

Shallow Module, Information Leakage, Temporal Decomposition, Overexposure, Pass-Through Method, Repetition, Special-General Mixture, Conjoined Methods, Comment Repeats Code, Implementation Documentation Contaminates Interface, Vague Name, Hard to Pick Name, Hard to Describe, Nonobvious Code. The chapters name two more: adjacent layers with similar abstractions, and pass-through *variables*. [S4]

The `vago-check-red-flags` skill holds the table of what each one means and looks like.

## 4. Guidance by chapter

### Strategic vs. tactical programming (ch. 3)
- **Tactical** programming tries to get the feature working fast, and each shortcut adds complexity. A "tactical tornado" is a prolific programmer who ships quickly and leaves wreckage for everyone else. [S4]
- **Strategic** programming treats working code as not enough. The main goal is a great design that also works, and it invests in design continuously.

### Deep vs. shallow modules (ch. 4)
- A module's value is the functionality it provides minus the cost of learning its interface. Deep means a small interface hiding a lot. Unix file I/O (open/read/write/close/lseek) is his standard example. [S3]
- "Classitis" is the habit of many tiny classes, each adding interface cost and little value.
- The interface includes informal parts too: ordering constraints, side effects, and errors callers must know about. All of these count toward its size.

### Information hiding and leakage (ch. 5)
- Each module hides design decisions (data formats, algorithms, file layouts) that no other module needs.
- Leakage happens when one decision affects several modules. The fix is usually to merge the code that shares the knowledge, or to pull it into one module.
- Structure code around knowledge, not around steps (temporal decomposition).
- Exposing internal data structures, for example by returning a mutable internal array, leaks too.
- Sensible defaults pull complexity down: the right thing happens without the caller asking.

### General-purpose vs. special-purpose (ch. 6)
- Make modules "somewhat general-purpose". The interface is general enough for several uses while the implementation does what's needed today. [S1]
- Ask: what is the simplest interface that covers all current needs? In how many situations will this method be used? Is the API easy to use for my current needs?
- Keep special-purpose code at the edges (top-level commands, output). Keep the core general.

### Different layer, different abstraction (ch. 7)
- Each layer changes the abstraction. If adjacent layers look the same, one of them probably isn't earning its place.
- Pass-through methods and pass-through variables are symptoms of this.
- A wrapper is justified only if it adds real function. Otherwise fold it into the underlying module or the caller.
- Interface duplication is fine only when each copy adds functionality, for example a dispatcher.

### Pull complexity downwards (ch. 8)
- If complexity is unavoidable, the module absorbs it rather than pushing it onto every caller.
- Configuration parameters often push decisions upward. Prefer computing a sensible value internally, and add a knob only when the caller really knows better.
- Pull down only complexity that is closely related to the module's existing job and that simplifies the system as a whole.

### Better together or better apart (ch. 9)
- Combine code when the pieces share information, are always used together, overlap conceptually, or are hard to understand separately. Combine when it simplifies the interface or removes duplication.
- Separate general-purpose code from special-purpose code.
- Length isn't the issue. A long function with a simple signature that reads top to bottom is fine. Split only if the result is cleaner abstractions, not just shorter functions. Each function should "do one thing and do it completely". [S4]
- After a split, each piece is understandable on its own (no conjoined methods).

### Define errors out of existence (ch. 10)
- Exceptions are a major source of complexity. Every thrown error is part of the interface, and handlers are rarely tested.
- Techniques: **define the semantics so the error can't happen** (deleting a missing thing succeeds; an out-of-range substring clamps instead of throwing). **Mask** the error at a low level. **Aggregate** many errors into one handler higher up. **Just crash** for errors that are rare, unrecoverable and not worth handling. [S4]
- Define special cases out of existence too: design the normal path so it covers them without `if` branches.
- Errors the caller must actually act on stay exposed.

### Design it twice (ch. 11)
- For any major interface or module, sketch at least two radically different designs, compare them, then choose or combine. It costs little at design time, and the first idea is often not the best. [S3, S4]

### Comments (ch. 12–13, 15)
- Comments capture what can't be in code: the abstraction, the reasons, units, invariants, edge-case behaviour, and what callers must or mustn't do.
- **Interface comments** say how to use a module or function and what it does, not how it works. **Implementation comments** explain *what* and *why* inside a body, not *how*. Cross-module comments explain decisions that span files.
- Comments sit at a different level of detail than the code: they add precision (exact semantics, units, boundary behaviour) or intuition (the big picture).
- **Write the comments first** (ch. 15). Write the interface comment before the body and use it as a design tool. If the comment is hard to write, the design is probably wrong. [S4]
- Ousterhout writes many times more comment lines than Martin, and holds that missing comments cost far more than wrong ones. [S2]

### Naming (ch. 14)
- Names are **precise** and **consistent**: they give a clear picture of the entity without the reader looking at its declaration.
- The same name means the same thing everywhere, and that name is never used for anything else.
- Short generic names like `i` belong only in very short scopes. The farther a name's uses are from its declaration, the longer the name. [S4]
- A name that's hard to pick is a design signal, not a naming problem.

### Modifying existing code (ch. 16)
- Stay strategic when you change code. After each change the system looks as if it had been designed that way from the start. If you aren't making the design better, you are probably making it worse. [S4]
- Comments live next to the code they describe and change in the same commit.

### Consistency (ch. 17)
- Consistency gives "cognitive leverage": once you learn how something is done in one place, that knowledge applies everywhere. [S4]
- Be consistent in names, coding style, interfaces, design patterns and invariants.
- A better idea is not worth an inconsistency unless the whole codebase switches.

### Code should be obvious (ch. 18)
- Code is obvious when a reader skimming it guesses correctly what it does.
- Things that hurt: control flow that is hard to trace (event-driven code), generic containers such as tuples instead of named types, a declared type that differs from the allocated type, and code that breaks reader expectations.
- Things that help: good names, consistency, judicious whitespace and comments.

### Where he disagrees with *Clean Code* [S2, S1]
- **Short methods.** Martin's "One Thing Rule" leads to over-decomposition and entangled shallow methods. Ousterhout wants deep methods, split only when it produces a cleaner abstraction.
- **Comments.** Martin sees comments as failures to express intent in code. Ousterhout says interface comments are what make abstraction possible, and long descriptive names can't replace them.
- **TDD.** Tiny test-first increments focus attention on passing the next test rather than on design, which makes them tactical. He prefers designing a larger unit (an abstraction) and then writing its tests.
