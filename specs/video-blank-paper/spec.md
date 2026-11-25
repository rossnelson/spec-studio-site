# Fix the blank paper in the demo videos

The demo videos on the site show about 15 seconds of blank cream paper: a scene card that follows another card never leaves, so its scene's footage never shows. This change fixes the card exit, adds a frame check with a contact sheet that runs after every video build and blocks a bad publish, and republishes both videos.

## Scope

### In scope
- The card styles in `video/theme/card.js`: a card that follows a card plays its exit. The intro, the outro, the end card and a plain scene card keep their behavior.
- A frame check for a built video: a contact sheet of the full video, 1 frame per second, tiled, with each frame's time, saved under the project's `build/` folder, and a failure on 3 seconds or more of plain paper or one flat color outside the intro, outro and end cards.
- `video/publish.sh` runs the frame check and refuses to publish a video that fails it.
- `video/README.md` says to run the frame check before `video/publish.sh`.
- Rebuilt and republished app and relay videos in `static/video/`, and correct sizes in `src/lib/videos.ts`.

### Out of scope
- Changes to `demo-video-tool` itself.
- New narration, new music, new footage or new scenes.
- A change to the card design (timings, colors, critters).

## Requirements

### R1 A card after a card leaves
A scene card that follows another card plays its full exit: the words lift, the critter jumps, and the paper slides up and off, so the scene's footage shows after the card.

#### R1.S1 The first card after the intro
- Given the app video's "One window" card, which follows the intro card
- When its hold ends
- Then the words and the critter leave and the paper slides up and off
- And the window footage of the 01-window scene shows until the next card

#### R1.S2 The relay video's first card
- Given the relay video's "Send a spec a message" card, which follows the intro card
- When its hold ends
- Then the paper leaves and the 01-ask terminal scene shows

#### R1.S3 The card styles are valid for each kind of card
- Given each kind of card: a plain scene card, a card after a card, a kept card (intro, outro) and the end card
- When the card mounts
- Then its paper has a valid animation list: a plain scene card fades in and slides out, a card after a card starts visible and slides out, a kept card keeps its paper, and the end card keeps its paper to the end

### R2 A frame check for each built video
A command checks a built video and makes a contact sheet of it, so that a person and the build can see each second of the video.

#### R2.S1 A contact sheet of the full video
- Given a built video in `video/build/` or `video/relay/build/`
- When a person runs the frame check on that project
- Then the project's `build/` folder has a contact sheet image with 1 frame for each second of the video, tiled, with the time under each frame

#### R2.S2 Blank paper fails the check
- Given a built video with 3 seconds or more of plain paper or one flat color outside the intro, outro and end cards
- When the frame check runs
- Then it exits with a failure and names the start and end time of each such stretch

#### R2.S3 A good video passes
- Given a built video where each stretch of plain paper or flat color is shorter than 3 seconds, or is inside the intro, outro or end card
- When the frame check runs
- Then it exits with success and prints the path of the contact sheet

### R3 Publish refuses a bad video
`video/publish.sh` publishes only a video that passes the frame check, and the README tells a person to run the frame check first.

#### R3.S1 A bad video does not publish
- Given a built video that fails the frame check
- When a person runs `video/publish.sh` (or `video/publish.sh relay`)
- Then the script stops with the check's failure and writes nothing to `static/video/`

#### R3.S2 The README names the check
- Given `video/README.md`
- When a person reads the Build section
- Then it says to run the frame check and look at the contact sheet before `video/publish.sh`

### R4 The published videos have no blank paper
Both videos on the site are rebuilt with the fix, pass the frame check, and the site lists their correct sizes.

#### R4.S1 The app video
- Given the rebuilt `static/video/spec-studio.mp4`
- When a person looks at its contact sheet
- Then each scene's footage shows after its card, and no stretch of blank paper shows outside the intro, outro and end cards

#### R4.S2 The relay video
- Given the rebuilt `static/video/spec-studio-relay.mp4`
- When a person looks at its contact sheet
- Then each scene's footage shows after its card, and no stretch of blank paper shows outside the intro, outro and end cards

#### R4.S3 The listed sizes
- Given the published MP4 files
- When the site renders a video's caption
- Then the size in `src/lib/videos.ts` matches the file's size, rounded to whole megabytes

## Edge cases
- A card after a card that is also kept (no such scene now): it starts visible and keeps its paper.
- The end card follows the outro card: it starts visible and never leaves.
- A scene with a short page time (under 3 seconds of footage between cards): the frame check does not flag it, because the cards and footage are not flat.
- A dark terminal scene: a dark terminal with text is not one flat color, so it passes.
- The intro opens on a card at rest, and the end card holds to the last frame: the check skips their time spans.

## Assumptions
- "Plain paper or one flat color" means a frame where almost all pixels are close to one color: fewer than 0.5% of the pixels of a small copy of the frame differ from the frame's median color by more than a small threshold. The paper grain does not count as content; a card's words and critter do.
- The check samples the video more often than once a second (2 frames each second), so a 3-second stretch is found to within half a second. The contact sheet uses 1 frame each second.
- The check reads the intro, outro and end card times from the project's `build/plan.json` (the scenes of kind `intro`, `outro` and `end`), so it runs on the build output, before the publish encode.
- The frame check is a Node script in `video/` (`video/check-frames.mjs <project dir>`). It uses ffmpeg to read frames and Playwright's Chromium (already a dev dependency) to draw the contact sheet, because this ffmpeg has no `drawtext` filter.
- The automated test for R1.S3 is a Playwright test that loads `video/theme/card.js` in a blank page and reads the computed animations of each kind of card.
- The rebuild uses the narration already in `build/audio` (`bin/demo build`, not `bin/demo all`), so no ElevenLabs call is needed.
