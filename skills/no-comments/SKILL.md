---
name: no-comments
description: "Spawn Comment Sicko, fix accepted findings, and report open work."
disable-model-invocation: true
---

# No comments

Spawn Comment Sicko. Act on accepted findings.

Defer to Comment Sicko's fresh perspective.

## Scope

Use the caller's files or diff. Otherwise use the current diff against the base branch, default `main`, including the working tree.

## Steps

1. Call `subagent({ agent: "comment-sicko", task: "<scope only>", async: false })`. Do not restate Comment Sicko's rules.
2. Inspect its report and diff. Reject application-code edits, scope escapes, exception-protected deletions, misstated `MUST KILL` reasons, and flags that treat kept intentional code as guilty. Reshape flags on our-code surprises stay actionable. Do not restore those comments. A keep survives only with proof it is about something we cannot change. Audit missed scoped lint and TypeScript suppressions. Correctness or safety suppressions stay actionable `MUST KILL`s. Restore deletions only with exact exceptions and scoped proof. If a kill is ambiguous, do not restore. If a keep is refuted or still ambiguous, delete it, except a `REVIEW` keep about an outside rule, which stays until someone checks that rule. Report `REVIEW` keeps and rejected findings open and go on with the accepted ones.
3. Fix trivial accepted flags directly by deleting a dead path, dropping a parameter, or using the real API. If any fix needs a shape, sketch it first (types, signatures, module boundaries), pick the simplest shape where each piece of state has one owner and callers need to know least, then stop at the sketch. Step 4 implements.
4. Implement the smallest root-cause fix in scope. Remove every named workaround. If the root cause is out of scope, land the smallest in-scope fix and report the rest open. Do not widen the fence, fix instances outside it, or bolt on symptom guards.
5. Report the deletion count, restored comments, `REVIEW` keeps, sketch, fixes, and other open work.