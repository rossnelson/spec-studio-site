---
title: The app
summary: The five stages, the three modes, the review, the panels, areas and projects, pause and archive, and the studio command.
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

![The Repos panel with three areas: Notes app in blue, Website in green and Sync in orange. Each area shows its repos and their specs. The spec sync-conflicts shows "waits for sync-lists".](shot:areas-sidebar "The Repos panel with three areas. Each area has its color, and its repos and specs are under it.")

A **project** is a goal that ends, with specs from one or more repos. It has a description, a status (Planned, In progress, Paused, Done or Canceled), an optional target date, optional milestones and project updates.

- Make a project with **New Project…** in the context menu of the Repos panel, or with the flag button at the top of the panel. The **Projects** section at the top of the Repos panel then lists the projects. Click a project to open its view: the progress, the milestones, the specs with their stage and turn, and the newest update.
- A spec can **wait for** other specs of its project. The sidebar shows "waits for" under a waiting spec. Spec Studio does not start a spec by itself.
- A Planned project moves to In progress when one of its specs starts. A Paused or Canceled project keeps its status. When all its specs ship, the project view offers **Mark as Done**.
- Pick a project in the New Spec sheet, or make the spec from the project view.

![The project view of the project Shared lists: its description, its target date, the progress, the newest update, the milestones Sync and Sharing, and its four specs. The spec sync-conflicts waits for sync-lists.](shot:project-view "The project view: the progress, the newest update, the milestones and the specs. One spec waits for another spec.")

Areas and projects are personal. They are in the backend plugin, not in your repos. With the JSON plugin they are on your Mac. With the Temporal plugin they are in Temporal. See [Backend plugins](/guides/backend-plugins/). The `studio project` commands change projects from any terminal, and Claude AI reads them through the relay:

```sh
studio specs --area Acme
studio project new "Backend plugins" --description "Plugins for the backend."
studio project add "Backend plugins" plugin-json --repo ~/code/plugin-json
studio project update "Backend plugins" --health on-track "The protocol is done."
```

### Pause a spec

Pause a spec when it must wait, for example for an API that is not ready. A pause deletes nothing.

- Pick **Pause…** in the context menu of the spec, or in its header. You can type a reason. In a terminal, run `studio pause --note "Waiting for the API"`. Add `--spec <slug>` outside the session of the spec.
- The session of the spec stops at the next safe point. The worktree, the branch, the pull requests, the documents and the history stay. The spec keeps its stage and its status.
- A paused spec never counts as "needs you". It is not in the Priority panel, the area badge, the Dock badge or a notification. Autopilot does not move it, and it does not start when you open the app.
- A paused spec shows dimmed, with a pause mark, in a folded **Paused** row at the bottom of its repo. You can still open it and read it. Its terminal shows the last screen and a **Resume** button.
- Messages from the relay wait in the inbox of the spec. Claude AI gets the answer "The spec is paused", with the reason.
- Choose **Resume** in the menu, in the header or in the terminal, or run `studio resume`. The session starts again, and the app types the messages that came while the spec was paused.
- To pause all the open specs of a project, choose **Pause Specs…** in the project view. A list of the specs shows first. This does not change the status of the project.

### Archive a repo

Archive a repo that you do not use now. Archive never deletes a file.

- Choose **Archive…** in the context menu of the repo. If the repo has open specs that are not paused, the confirmation offers to pause them first. In a terminal, run `studio repo archive <path>`. Add `--pause-specs` to pause the open specs. Run `studio repo unarchive <path>` to undo it.
- An archived repo moves to a folded **Archived** row at the bottom of its area. It has no session, and its specs never count as "needs you".
- The relay leaves an archived repo out of its lists, unless the call has `archived: true`. The relay keeps what it has already.
- **Unarchive** puts the repo back in its place in the area. Its paused specs stay paused.
- When a repo has had no open spec and no event for 30 days, Spec Studio shows a quiet "Archive this repo?" suggestion once. Spec Studio never archives a repo by itself.

### Archive a project

- Choose **Archive** in the project view or in its context menu. A Done or Canceled project archives at once. For other projects, Spec Studio asks you to pause the open specs first, or to cancel.
- An archived project leaves the project list and the project filters. It moves to a folded **Archived** row at the bottom of the Projects section. The project picker of the New Spec sheet lists it under **Archived projects**. Its specs keep their link to it.
- The view of an archived project is read-only, with an **Unarchive** button.
- In a terminal, run `studio project archive <name>` or `studio project unarchive <name>`. `studio project list --archived` lists the archived projects.

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
