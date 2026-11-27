# Screenshots and clips of the app

These scripts make the screen clips and stills of the video (`video/clips/`, `video/stills/`) from a test copy of Spec Studio with the demo repo `spec-studio-app/notes-demo` (cloned to `/Users/Shared/spec-studio-demo/notes`, so no home folder name shows). The guides do not use screenshots: they draw live SVG prototypes (`src/lib/protos/`).

1. Build the test copy from the app repo: `OUT="$HOME/Library/Caches/Spec Studio/try/marketing" ./scripts/bundle.sh`.
2. Make its support folder with only the demo repo: `support/repos.json` with `[{"path": "/Users/Shared/spec-studio-demo/notes"}]`.
3. `swiftc -O -o windows windows.swift` (lists the window IDs of a process).
4. `./launch "TokyoNight Storm" <support folder> sessions [-key value ...]` opens the copy at 1280×800 with a theme, on the demo spec. Its arguments override the theme and the window for this run; see "The settings of the installed app" below.
5. `./shoot -dark` (or `./shoot ""` with a light theme such as "TokyoNight Day") points the reader at each section with `studio focus` and takes each window.
6. `./rec <seconds> <file.mp4>` records the window's area with ffmpeg.
7. Convert each still to WebP (see "What a person does" below).

`cap` and `rec` start `screencapture` and `ffmpeg` through Ghostty, because macOS refuses a capture from a Claude session inside Spec Studio, and Ghostty has the Screen Recording permission.

Keys and menus work the same way: run `osascript` through Ghostty, which has the Accessibility permission. Bring the test copy to the front by its pid (`set frontmost of (first process whose unix id is <pid>) to true`), then press keys (⌃⌘T for the shell, ⌃⌘2 for Priority, ⌘N for the New Spec sheet) or click a menu item (`click menu item "Settings…" of menu 1 of menu bar item 2 of menu bar 1 of …`). A click does not focus a text field: set `focused` of the field through Accessibility, then type. A capture with `-l <sheet window id>` includes the window behind the sheet.

Before a shot or a clip goes in, check every frame for a private repo, spec or session name, an account name, or a path in a home folder.

## The settings of the installed app

The test copy shares its settings store with the installed app. `launch` saves the keys that the test copy writes (the selected spec, the window frame, the sidebar panel, the reader tab) on its first run. When you are done, run `./restore`: it quits the test copy and puts those keys back.

## Clips for the video

`./rec 26 ../../video/clips/stages.webm` records a WebM, which `video/stage.html` plays. An `.mp4` is H.264, which the recorder's Chromium cannot play: convert it with `ffmpeg -i in.mp4 -c:v libvpx-vp9 -b:v 3M -an out.webm`.

## What a person does

`first-open` needs a support folder with no repo (`./launch <theme> <empty folder>`). `new-spec` needs ⌘N and `settings-relay` needs ⌘, in the test copy, then `./cap -x -o -l <window id> shots/<name>.png`. Convert every shot with `cwebp -q 82 -resize 1600 0 shots/<name>.png -o ../../video/stills/<name>.webp`.

## Areas and projects

The stills of areas and projects (`static/shots/` for the guides, `video/stills/` for the video) use their own demo data, never your support folder:

1. `./demo-areas` makes the support folder `$TRY/support-areas`: two more demo repos (`/Users/Shared/spec-studio-demo/notes-web` and `notes-sync`, local git repos with demo specs), three areas ("Notes app", "Website" and "Sync") and the demo project "Shared lists", with two milestones and a spec that waits for another spec. Run it again to start from the same data.
2. `./shoot-areas "TokyoNight Day" ""` and `./shoot-areas "TokyoNight Storm" -dark` take `areas-sidebar`, `areas-folded` (the Website area folded, with its badge) and `project-view` (opened with `-selectedSpec project:<id>`) into `shots/`.
3. `./restore`.
4. Convert with `cwebp -q 82 -resize 1600 0`: the light and dark `areas-sidebar` and `project-view` go to `static/shots/<name>.webp` and `<name>-dark.webp`; the three dark stills go to `video/stills/<name>.webp`.
