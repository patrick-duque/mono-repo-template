---
name: grilling
description: Clarify an ambiguous request before writing code. Use when a request has multiple materially different readings, would require inventing requirements, spans more than three files without a pinned approach, or when the user says "grill me" or asks to stress-test a plan.
---

# Grilling

Resolve ambiguity in one round of questions before any code is written.

## When to run

Run when any of these is true:

- Two or more readings of the request lead to materially different work.
- Doing the task would mean inventing a requirement, API, file path, flag, or fact.
- The change spans more than three files and the approach is not pinned down.
- You catch yourself thinking "I'll assume X" where X changes the output.

Skip when the task is a single bounded edit, the same work was already grilled this session, or the
repo has an obvious conventional default (use it and say so).

## Steps

1. Read enough of the repo to know what is already decided. Check `AGENTS.md`, the workspace guide
   (`apps/*/docs/*_GUIDE.md`), and the code you would touch. Do not ask what the repo answers.
2. List every open decision that changes the output: scope boundary, target files, naming,
   behavior, data shape, dependencies, migration impact.
3. Drop any decision with an obvious default. Keep the rest.
4. Ask them all in one message:
   - Number each question.
   - Give your recommended answer and a one-line reason for each.
   - Offer concrete options when there are a few clear choices.
5. Wait for the answers. Do not start coding in the same turn.
6. Restate the agreed decisions in one short list, then proceed. Later questions on the same work
   only cover new information.

## Example

```txt
Before I start, 3 decisions:

1. Scope: delete only files with zero importers, or also unexport internal-only symbols?
   Recommended: zero-importer files only. Unexporting is noisy and low value.
2. Migrations: edit the baseline in place or add a new migration?
   Recommended: edit in place, since no environment has applied it yet.
3. Placeholder packages: keep packages/ui and packages/config?
   Recommended: delete. Nothing imports them.
```
