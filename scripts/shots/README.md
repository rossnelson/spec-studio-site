# Screenshots and clips of the app

The guide screenshots (`static/guides/`) and the screen clips of the video (`video/clips/`) come from a test copy of Spec Studio with the demo repo `spec-studio-app/notes-demo` (cloned to `/Users/Shared/spec-studio-demo/notes`, so no home folder name shows).

1. Build the test copy from the app repo: `OUT="$HOME/Library/Caches/Spec Studio/try/marketing" ./scripts/bundle.sh`.
2. Make its support folder with only the demo repo: `support/repos.json` with `[{"path": "/Users/Shared/spec-studio-demo/notes"}]`.
3. `swiftc -O -o windows windows.swift` (lists the window IDs of a process).
4. `./launch "TokyoNight Storm" <support folder> sessions` opens the copy at 1280×800 with a theme, on the demo spec. Its arguments override the theme and the window for this run; see "The settings of the installed app" below.
5. `./shoot -dark` (or `./shoot ""` with a light theme such as "TokyoNight Day") points the reader at each section with `studio focus` and takes each window.
6. `./rec <seconds> <file.mp4>` records the window's area with ffmpeg.
7. Convert each shot to WebP (see "What a person does" below).

`cap` and `rec` start `screencapture` and `ffmpeg` through Ghostty, because macOS refuses a capture from a Claude session inside Spec Studio, and Ghostty has the Screen Recording permission. The New Spec sheet and the Settings window need ⌘N and ⌘,: a person presses them, because the test copy shares its bundle ID with the installed app and a script cannot bring it to the front.

Before a shot or a clip goes in, check every frame for a private repo, spec or session name, an account name, or a path in a home folder.

## The settings of the installed app

The test copy shares its settings store with the installed app. `launch` saves the keys that the test copy writes (the selected spec, the window frame, the sidebar panel, the reader tab) on its first run. When you are done, run `./restore`: it quits the test copy and puts those keys back.

## Clips for the video

`./rec 26 ../../video/clips/stages.webm` records a WebM, which `video/stage.html` plays. An `.mp4` is H.264, which the recorder's Chromium cannot play: convert it with `ffmpeg -i in.mp4 -c:v libvpx-vp9 -b:v 3M -an out.webm`.

## What a person does

`first-open` needs a support folder with no repo (`./launch <theme> <empty folder>`). `new-spec` needs ⌘N and `settings-relay` needs ⌘, in the test copy, then `./cap -x -o -l <window id> shots/<name>.png`. Convert every shot with `cwebp -q 82 -resize 1600 0 shots/<name>.png -o ../../static/guides/<name>.webp` (900 wide for `settings-relay`).
