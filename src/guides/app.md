---
title: The app
summary: The five stages, the three modes, the review, the panels, areas and projects, and the studio command.
order: 2
---

## The window

The window has four parts:

- **The sidebar** on the left: your repos and their specs. Its panels are at the bottom.
- **The Claude session** of the selected spec, a real terminal that runs `claude`. You talk to Claude here.
- **The reader**: the spec, the plan, the changes, the review and the activity of the spec. Claude points the reader at what is new.
- **The status strip** at the top: the stage, whose turn it is, and the note that Claude sets, for example "Ready for your review."

![The Spec Studio window with its four parts: 1 the sidebar, 2 the status strip, 3 the reader, 4 the Claude session](proto:window)

Hide or show each part from the **View** menu: the spec list (⌃⌘S), the reader (⌃⌘R), Claude (⌃⌘C) and the shell (⌃⌘T). ⌘1 to ⌘8 open the sections of the reader. **Help > Keyboard Shortcuts** (⌘/) lists every shortcut.

## The five stages

Each spec goes through five stages, in order. Each stage ends at a gate.

1. **Spec.** Claude writes `spec.md`: a summary, the scope, and requirements with Given/When/Then scenarios. At the gate you approve what the change does.
2. **Plan.** Claude studies the code and writes `plan.md`: the approach, the repos that change and their merge order, the steps and the test for each scenario. At the gate you approve how it is built.
3. **Build.** Claude builds each step in a worktree on the branch `spec/<slug>`, commits, pushes and opens a draft pull request in each repo. At the gate you approve the build for review.
4. **Check.** Claude runs the self review on each pull request and proves each scenario. At the gate you approve the result, and the pull requests become ready for review.
5. **Merge.** Claude works through the reviewers' comments with you, and merges the pull requests in merge order when you say so.

![The reader on a plan while Claude writes it: the approach, the steps and the tests come in](proto:plan)

A spec can go back to an earlier stage, for example when the review finds a change that the plan missed.

## The three modes

Choose the mode in the New Spec sheet. Change it later with **Spec > Mode**.

### Autopilot

Claude goes from your description to reviewed draft pull requests with no question in between. It decides what the description leaves open and lists its assumptions in the spec. It stops only when it is blocked, and once at the end: mark the pull requests ready for review, or ask for changes. Choose Autopilot for most changes, when you can describe the result in a few sentences.

### Guided

Claude interviews you one question at a time, writes the spec with you, and stops for your approval at each gate. Choose Guided for a large or unclear change, where the decisions are yours to make.

### Loop

No interview and no plan. You ask for one small change at a time, and each change gets its commit and its proof. When you leave the loop, the spec goes to Check. Choose Loop to polish something with quick turns, for example the details of a screen. You can also start a loop from any stage: tell Claude "let's loop".

## The review

In Check, the self review reads each pull request with parallel finder agents. A second group of agents votes on each candidate, and a finding needs two of three votes. Confirmed findings go to the triage list of the spec, with their file and their severity. A failed CI check is a finding too.

In Guided, Claude asks you about each finding: fix it, or leave it. In Autopilot, Claude fixes the important findings itself, reviews the new commits again, and lists each finding it left in its summary.

![A self review round: gather context, find, vote, filter and rank, report; two findings come in and are fixed, and round 2 finds no issues](proto:review)

## The shell panel

Each spec has a shell beside its Claude session, in the spec's worktree. Use it to run the app, the tests or `git`, without leaving the window. Show it with **View > Show Shell** (⌃⌘T).

## The sidebar panels

- **Repos** (⌃⌘1): each repo and its open specs, with the stage and the turn of each spec.
- **Priority** (⌃⌘2): the specs that need you first, across all repos. The panel's icon shows how many need you.
- **Shipped** (⌃⌘3): the merged specs, newest first, with a filter.

## Areas and projects

An **area** is a group of repos, for example all the repos of one client. A repo is in one area, or in none.

- Make an area with **New Area…** in the context menu of the Repos panel. Rename it, pick its color or delete it from the context menu of its header. When you delete an area, its repos stay in Spec Studio.
- Drag a repo into an area, between areas, or below the last area to remove it from all areas. Drag an area header to change the order.
- Click a header to fold the area. Option-click a header to fold all the other areas. A folded area shows how many of its specs need you.
- When you add a repo, Spec Studio can suggest an area: an area with the same GitHub owner, the same parent folder, or shared specs. Click **Add** or **Dismiss**. Spec Studio never moves a repo by itself.
- The Priority panel can show one area only. A notification names the area of its spec.

A **project** is a goal that ends, with specs from one or more repos. It has a description, a status (Planned, In progress, Paused, Done or Canceled), an optional target date, optional milestones and project updates.

- The **Projects** section at the top of the Repos panel lists the projects. Click a project to open its view: the progress, the milestones, the specs with their stage and turn, and the newest update.
- A spec can **wait for** other specs of its project. The sidebar shows "waits for" under a waiting spec. Spec Studio does not start a spec by itself.
- A project moves to In progress when one of its specs starts. When all its specs ship, the project view offers **Mark as Done**.
- Pick a project in the New Spec sheet, or make the spec from the project view.

Areas and projects are personal. They stay on your Mac, in the app's support folder, and not in your repos. The `studio project` commands change projects from any terminal, and Claude AI reads them through the relay:

```sh
studio specs --area Vendgogh
studio project new "Backend plugins" --description "Plugins for the backend."
studio project add "Backend plugins" plugin-json --repo ~/code/plugin-json
studio project update "Backend plugins" --health on-track "The protocol is done."
```

## Settings

**Spec Studio > Settings…** (⌘,) has the **Remote Relay** pane, where you pair this Mac with your relay. See [The relay](/guides/relay/). Choose the colors of the app and its terminals with **View > Theme…**.

## The studio command

Spec Studio includes the `studio` command, and its Claude sessions use it to change the state of a spec. You can use it in any terminal too. These are the commands that you type most:

Make a spec in the repo of the current folder, and start its session:

```sh
studio new "Count the open notes" --slug open-count --description "Show how many notes are still open, next to the heading." --start
```

List the open specs of your repos, with the stage and the turn of each:

```sh
studio specs
```

Print the state of one spec. `--home` names its repo, here the current folder:

```sh
studio --home . --spec open-count show
```

Start or show the session of a spec. Spec Studio adds the repo when it is not in its list:

```sh
studio start open-count
```

Change the mode of a spec:

```sh
studio --home . --spec open-count mode guided
```

Inside a spec's session, `studio status` sets the stage's status and the note that the status strip shows. Claude runs it; you rarely need it:

```sh
studio status waiting --note "Paused."
```

`studio --help` lists every command.
