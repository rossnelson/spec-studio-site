# Plan: Fix the blank paper in the demo videos

## Approach

**The card fix.** `style(B, out, o)` in `video/theme/card.js` builds the `.demo` paper's CSS from two strings: `enter` (`opacity:0;animation:demoFadeIn …` or, after a card, `opacity:1`) and `leave` (`, demoPaperOut …`). When `o.afterCard` is set and the card is not kept, the result is `opacity:1, demoPaperOut …`: no `animation:` property, so the browser drops the declaration and the paper never leaves. The fix builds the paper's animations as a list (`demoFadeIn` unless after a card, `demoPaperOut` unless kept or the end card), and writes `opacity:<0 or 1>` plus `animation:<list joined by ", ">` only when the list is not empty. The `exit()` helper for the inner parts (critter, rule, number, title, subtitle) already appends to a real `animation:` property, so those stay as they are. All four cases are then valid: a plain scene card (fade in, slide out), a card after a card (visible, slide out), a kept card (fade in or visible, no slide), the end card (no slide).

To test it without a video build, a Playwright test loads `card.js` into a blank page (`page.setContent` and `page.addScriptTag`), sets `window.__demoConfig` with the theme, calls `window.__demo.transition(…)` and `window.__demo.end(…)` with each set of options, and reads `getAnimations()` of the `.demo` element in the shadow root. It asserts the animation names for each case. The test needs no server, so it runs in the existing `releases` project.

**The frame check.** A new script, `video/check-frames.mjs <project dir>` (for example `video` or `video/relay`). Choice: one Node script, not a shell script, because it must read `plan.json` and the project's scene kinds and do the pixel math. It:
1. Imports the project's `project.mjs` for its `name` and the scenes' `kind`, and reads `build/plan.json` for each scene's `start` and `end`. The skipped spans are the scenes of kind `intro`, `outro` and `end` (the end card runs from its start to the end of the video).
2. Runs ffmpeg on `build/<name>.mp4` at 2 frames each second, scaled to 160x90, as raw RGB to stdout. For each frame it takes the per-channel median color and counts the pixels whose largest channel difference from it is more than 24. A frame is flat when that count is under 0.5% of the pixels.
3. Joins consecutive flat frames into stretches, drops the parts inside a skipped span, and fails on each stretch of 3 seconds or more, with its start and end time.
4. Runs ffmpeg again at 1 frame each second, scaled to 320x180, into JPEG files in `build/contact/`, and draws `build/contact-sheet.html` (a grid of the frames, each with its `m:ss` time, flat frames outlined) and screenshots it with Playwright's Chromium to `build/contact-sheet.png`. Choice: Chromium, because this ffmpeg has no `drawtext` filter and Playwright is already a dev dependency.
5. Prints the sheet's path and the result, and exits 1 on a failure.

**Publish.** `video/publish.sh` runs `node check-frames.mjs "$DIR"` before any ffmpeg encode, so `set -e` stops it and nothing is written to `static/video/`. `video/README.md` adds the check, and a line to look at the sheet, to the Build section.

**The rebuild.** In the worktree, copy the ignored build inputs from the main checkout (`video/build/` and `video/relay/build/` for `audio/`, `durations.json` and `beats.json`, and `video/build-music.mp3`), then `MUSIC=$PWD/video/build-music.mp3 PLAYWRIGHT_DIR=$PWD ../demo-video-tool/bin/demo build video` and the same for `video/relay`. Choice: `build`, not `all`, so the narration is reused and no ElevenLabs call is made. Then `bin/demo splash` for each poster, the frame check, `video/publish.sh` and `video/publish.sh relay`, and set the sizes in `src/lib/videos.ts` in MiB rounded, as the current "33 MB" for a 34.4 MB file shows.

The Playwright test that guards R1.S3 is one guard; the frame check on the rebuilt videos is the proof for R1.S1, R1.S2 and R4. The contact sheets are the UAT evidence.

## Repos
| Repo | Why it changes | Merge order |
|---|---|---|
| spec-studio-site | The card theme, the frame check, publish, README, the videos and their sizes | 1 |

## Steps
1. spec-studio-site: fix `style()` in `video/theme/card.js` so the paper's animations are one valid list for each kind of card, and add `tests/video-card.spec.ts`. Covers R1.
2. spec-studio-site: add `video/check-frames.mjs` (flat-frame check and contact sheet). Covers R2.
3. spec-studio-site: run the check from `video/publish.sh` before the encode, and document it in `video/README.md`. Covers R3.
4. spec-studio-site: rebuild both videos with the fix, run the check, look at every frame of both contact sheets, publish to `static/video/`, and set the sizes in `src/lib/videos.ts`. Covers R1, R4.

## Tests
- R1.S1: the frame check passes on the rebuilt app video, and its contact sheet shows the window footage after the "One window" card (UAT, step 4).
- R1.S2: the frame check passes on the rebuilt relay video, and its contact sheet shows the 01-ask terminal after the "Send a spec a message" card (UAT, step 4).
- R1.S3: `tests/video-card.spec.ts` mounts each kind of card from `card.js` and asserts the paper's animation names: plain = `demoFadeIn`, `demoPaperOut`; after a card = `demoPaperOut` only, opacity 1; kept = `demoFadeIn` only; end card = `demoFadeIn` only; end card after a card = none, opacity 1.
- R2.S1: run `node video/check-frames.mjs video`; `video/build/contact-sheet.png` exists with one tile for each second, each with its time.
- R2.S2: run the check on the old app video (the build in the main checkout, before the rebuild); it fails and names the stretch at about 0:16 to 0:30.
- R2.S3: run the check on the rebuilt videos; it exits 0 and prints the sheet's path.
- R3.S1: run `video/publish.sh` against the old app build; it stops with the check's failure, and `static/video/` is unchanged (`git status`).
- R3.S2: read `video/README.md`'s Build section.
- R4.S1: the contact sheet of the rebuilt app video, every frame read.
- R4.S2: the contact sheet of the rebuilt relay video, every frame read.
- R4.S3: compare `ls -l static/video/*.mp4` in MiB with `src/lib/videos.ts`; `tests/video.spec.ts` still passes.

## Risks
- The flat threshold could flag a dark or sparse scene, or miss blank paper with its grain. The plan tunes it against the old video (must fail) and the new ones (must pass), and keeps the numbers in named constants at the top of the script.
- A recording can drift from the plan (a late scene). `bin/demo build` logs late scenes in `record.log`; the plan reads it after each build.
- The new MP4s add about 70 MB to the repo history again, as each video update does now.
