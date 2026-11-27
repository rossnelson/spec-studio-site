# The videos

Two `demo-video-tool` projects. The site serves their output from `static/video/`, and `src/lib/videos.ts` lists them.

- `project.mjs`: the app video, on the launch page and the guides page. The window, the New Spec sheet and its three modes, the five stages, the shell, the review, the Priority panel, areas and projects, and the themes. No relay.
- `relay/project.mjs`: the relay video, on the relay guide. A message from Claude AI and its answer, how the relay connects, the pluggable store (JSON files by default, Temporal as an option), the attachment bucket, and the ways to run it.

Both record `stage.html`, which shows one thing for each scene:

- `?still=stills/a.webp`: a still. `&zoom=x,y,scale`: `play(seconds)` moves in slowly on that point.
- `?still=stills/a.webp,stills/b.webp`: stills in turn. `play([t1, ...])` shows the next one at each time.
- `?clip=<name>&from=<s>&to=<s>`: part of a screen clip in `clips/`.
- `?term=<name>`: a terminal that replays a real `claude -p` run from `transcripts.json`.
- `?diagram=<part>`: the relay and its backends. `light(part)` lights one part and shows its settings: `link`, `store`, `json`, `temporal`, `bucket`, `nobucket`, `run` or `all`.

`stage.mjs` has the local server and helpers that both projects use.

## The footage

- `stills/`: the test copy of the app on the demo spec, made with `scripts/shots/` (see its README). `areas-sidebar`, `areas-folded` and `project-view` use the demo data of `scripts/shots/demo-areas`.
- `clips/relay-message.webm`: a message from Claude Code through the local relay arriving in the demo spec's session, and the answer. Cut so no other session's name shows.
- `clips/stages.webm`: the reader moving through Spec, Plan, Build and Check (not used now).
- `transcripts.json`: the real `claude -p` runs against the relay (`--output-format stream-json`).

## Build

```sh
export MUSIC=<an instrumental bed, at least 3 minutes> PLAYWRIGHT_DIR=$PWD
<demo-video-tool>/bin/demo all video
<demo-video-tool>/bin/demo all video/relay
node video/check-frames.mjs video          # video/build/contact-sheet.png
node video/check-frames.mjs video/relay    # video/relay/build/contact-sheet.png
video/publish.sh          # static/video/spec-studio.*
video/publish.sh relay    # static/video/spec-studio-relay.*
```

Run `check-frames.mjs` on each video before `publish.sh`, and look at every frame of its contact sheet: one frame for each second, with its time. The check fails on 3 seconds or more of plain paper or one flat color outside the intro, outro and end cards (a card that never left, a scene that never drew). `publish.sh` runs the same check first and publishes nothing when it fails.

Before `publish.sh`, review every frame of the new video on contact sheets: one frame a second, each with its time, 30 frames a sheet.

```sh
python3 -I video/contact-sheet.py video/build/spec-studio.mp4 <out dir>
```

Read each sheet. Look for blank paper, a broken still, a private repo, spec, session or account name, and a path in a home folder. Fix a bad frame and build again before you publish.

Then set the length and size of each video in `src/lib/videos.ts`.
