---
title: Get started
summary: Install Spec Studio, add a repo and make your first spec.
order: 1
---

Spec Studio is a Mac app for spec-driven development with Claude Code. You describe a change. Claude writes a spec and a plan, builds the change, opens draft pull requests and reviews them. Spec Studio shows each step, and you approve where it matters.

## Requirements

- A Mac with Apple silicon and macOS 26 or later.
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code), signed in. Spec Studio runs `claude` in its own terminals.
- The [GitHub CLI](https://cli.github.com), signed in with `gh auth login`. Spec Studio uses it to open pull requests and to read their checks.
- A git repo with a GitHub remote.

## Install

{{install}}

## First open

Open Spec Studio from Applications. The first time, the window is empty: there is no repo yet.

![Spec Studio with no repo: the window says "Nobody's home yet", and the pointer clicks Add a Repo](proto:first-open)

## Add a repo

Click **Add a Repo…**, or choose **File > Add Repository…** (⌘O), and choose the folder of a git repo. Spec Studio keeps the specs of a repo in its `specs/` folder, one folder for each spec. You can add as many repos as you like.

![The Repos panel: the repo notes appears, then its first spec, open-count, in Autopilot](proto:repo-added)

## Your first spec

1. Choose **File > New Spec…** (⌘N).
2. Leave the mode on **Autopilot**.
3. Give the spec a title of a few words, and describe the change in a few sentences: what a user sees when it is done.
4. Click **Create**.

![The New Spec sheet in Autopilot: the title and the description are typed in, the slug follows the title, and the pointer clicks Create](proto:new-spec)

Spec Studio starts a Claude session for the spec. In Autopilot, Claude writes the spec and the plan, builds the change on a new branch in a worktree, opens a draft pull request, and runs a self review that fixes what it finds. You can read each document in the reader while Claude writes it.

![The header of a spec in Autopilot: Spec, Plan and Build get their checks as Claude works, the status says what it does, and the spec stops in Check with Over to you](proto:autopilot)

When the work is ready, Spec Studio notifies you and Claude asks one question: mark the pull requests ready for review, or ask for changes. You can also type to Claude at any time, for example to change the spec while it builds.
