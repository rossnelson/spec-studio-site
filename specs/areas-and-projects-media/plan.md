# Plan: Areas and projects on the site

## Approach

**The footage.** The stills come from the test copy of the app (`~/Library/Caches/Spec Studio/try/marketing`), built again from the app repo's `main` (cbec2a6, "Areas and projects (#39)") with `scripts/bundle.sh`. A new script, `scripts/shots/demo-areas`, makes the demo data in a new support folder (`$TRY/support-areas`), and never in the user's support folder:

- three invented demo repos in `/Users/Shared/spec-studio-demo/`: the existing `notes` (the demo spec `open-count`), and two new local git repos, `notes-web` and `notes-sync`, each with one or two demo specs made with `studio new --home <repo>`;
- `repos.json` with the three repos;
- `areas.json` with three areas: "Notes app" (blue: `notes`), "Website" (green: `notes-web`) and "Sync" (orange: `notes-sync`). The names are short and neutral;
- `projects.json`, made with the `studio project` commands: the demo project "Shared lists", In progress, with the milestones "Sync" and "Sharing", four specs across the repos, a spec that waits for another spec, and one project update.

A demo spec that needs the user (status `awaiting-approval`) is in each area, so a folded area shows its badge. The script writes JSON only through `studio` when a command exists, and writes `areas.json` directly because `studio` has no area command.

`./launch` opens the test copy on this support folder in "TokyoNight Day" and "TokyoNight Storm". Each capture goes through `./cap` as before. The folded area and the project view need a click: `osascript` through Ghostty, the same as the README says for keys and menus, or `areas.json` with `"folded": true` and the `selectedProject` setting on launch, which is simpler and repeatable. The plan uses the JSON way first, and a click only when the app has no setting for it.

Three stills, each light and dark: `areas-sidebar`, `areas-folded` and `project-view`. They are converted with `cwebp -q 82 -resize 1600 0`. Each still is checked at full size for a private name or a home path before it goes in.

**The guide.** The guides use `marked` (`src/lib/guides.ts`) with special image schemes: `video:` and `proto:`. A new scheme, `shot:<name>`, renders a figure with a `<picture>`: a `<source media="(prefers-color-scheme: dark)">` for the dark still, an `<img loading="lazy">` for the light still with its width and height, the alt text from the Markdown, and the title as the caption. This is the same pattern as `Sketch.svelte` (no JavaScript, the right first paint). A new module `src/lib/shots.ts` lists each guide still with its files and size, and the renderer throws on an unknown name, the same as `video:`. The files go in `static/shots/`. The "Areas and projects" section gets two figures: the sidebar with areas (after the area list) and the project view (after the project list). The folded still goes only in the video.

**The video.** A new scene `09-areas` in `video/project.mjs`, after `08-turn` (Priority) and before the themes scene (renumbered `10-themes`, `11-outro`, `12-end`). It uses the dark stills in turn: `areas-sidebar`, `areas-folded`, `project-view`, with `play([t1, t2])`, the same as the other multi-still scenes. A card critter that exists in `video/theme/` is reused. The narration is short Simplified Technical English, about 12 seconds, so the scene with its card is under 25 seconds.

The full video is built again with `demo-video all video` (ElevenLabs narration for the new scene, the existing music bed). Then a script, `video/contact-sheet.sh`, takes one frame per second from `video/build/spec-studio.mp4` with `ffmpeg` and tiles them into sheets of 5×6 frames with timestamps, in the scratchpad. Claude reads every sheet. A bad frame (blank paper, a broken still, a private name) gets a fix and a new recording before publish. Then `video/publish.sh` writes `static/video/spec-studio.*`, and `src/lib/videos.ts` gets the new size and a caption that names areas and projects.

Choices made without the user:
- `shot:` and `static/shots/`, not more SVG prototypes: the spec asks for real stills in light and dark.
- Stills in turn, not a screen clip, for the fold: the other scenes use stills, a still pair is repeatable, and a clip needs Accessibility clicks in each new recording.
- The scene goes after Priority: areas and projects are about organizing many specs, which follows the Priority panel.

## Repos
| Repo | Why it changes | Merge order |
|---|---|---|
| spec-studio-site | The stills, the guide, the video and its scene | 1 |

## Steps
1. spec-studio-site: `scripts/shots/demo-areas` makes the demo repos, specs, areas and project in a separate support folder; `scripts/shots/README.md` says how. Take the three stills in light and dark; put the guide stills in `static/shots/` and the dark stills in `video/stills/`. Covers R1.
2. spec-studio-site: the `shot:` image scheme in `src/lib/guides.ts` with `src/lib/shots.ts` and the figure style in `src/app.css`; two figures and their captions in the "Areas and projects" section of `src/guides/app.md`; tests in `tests/guides.spec.ts`. Covers R2.
3. spec-studio-site: the `09-areas` scene in `video/project.mjs`, the renumbered scenes, and `video/README.md`. Covers R3.
4. spec-studio-site: build the video again, `video/contact-sheet.sh`, review every frame on the sheets, fix and record again if a frame is bad. Covers R4.
5. spec-studio-site: `video/publish.sh`, the new `static/video/spec-studio.*`, the size and caption in `src/lib/videos.ts`, and a test that the size in `videos.ts` matches the file. Covers R5.

## Tests
- R1.S1: Claude opens `areas-sidebar` (light and dark) and checks two or more colored areas with their repos, and the demo spec. Noted in the build notes.
- R1.S2: Claude opens `areas-folded` and checks the folded header with its badge.
- R1.S3: Claude opens `project-view` and checks the progress, the milestones, the specs and the "waits for" line.
- R1.S4: Claude reads each still at full size for a private repo, spec, session or account name, or a home path. The demo data uses only `/Users/Shared/spec-studio-demo/`.
- R1.S5: a Playwright test in `tests/guides.spec.ts` checks that each still in `src/lib/shots.ts` has a light and a dark file in `static/shots/`; `ls video/stills` shows the dark video stills.
- R2.S1: a Playwright test opens `/guides/app/`, finds two `figure.shot` in the "Areas and projects" section, and checks that each `img` has an alt text longer than 20 characters and loads (`naturalWidth > 0`).
- R2.S2: a Playwright test with `colorScheme: 'dark'` checks that `currentSrc` of each image ends in `-dark.webp`, and with `colorScheme: 'light'` that it does not.
- R2.S3: the same test checks `loading="lazy"`, and that at a 375 px viewport `scrollWidth` is not larger than `clientWidth`.
- R3.S1: the contact sheets show the scene: the sidebar with areas, the folded area, then the project view; the narration text in `video/project.mjs` says what an area and a project are.
- R3.S2: `video/build/plan.json` gives the scene's start and end; the scene with its card is 25 seconds or shorter.
- R4.S1: `video/contact-sheet.sh` writes sheets at one frame per second from 0 s to the end; the count of frames equals the video length rounded up.
- R4.S2: Claude reads every sheet and lists any bad frame; the published video is the one with no bad frame.
- R5.S1: the existing test `tests/video.spec.ts` (poster, captions, plays) passes on the new files; the contact sheets of the published MP4 include the new scene.
- R5.S2: a new test in `tests/video.spec.ts` checks that the size in `videos.ts` equals the file size in MB, rounded; the existing test checks 40 MB or smaller; a test checks that the app caption names areas and projects.

## Risks
- The test copy shares its settings store with the installed app: `./launch` saves the keys first, and `./restore` puts them back at the end.
- The app may have no setting to open a project view or a folded area at launch. Then the script clicks through Ghostty with `osascript`, as the README says.
- macOS refuses a capture from this session: `./cap` runs `screencapture` through Ghostty, as before.
- The ElevenLabs narration of the other scenes may change if their text changes. Only the new scene's text is new, so the tool keeps the other audio files.
- A longer video may pass 40 MB: at 1400 kb/s, 200 s is about 38 MB. If the file is too large, the scene gets shorter.
- Blank paper between scenes was a past bug (#9): the contact sheet review looks for it at each cut.
