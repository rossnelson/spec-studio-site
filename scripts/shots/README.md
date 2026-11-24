# Screenshots and clips of the app

The guide screenshots (`static/guides/`) and the screen clips of the video (`video/clips/`) come from a test copy of Spec Studio with the demo repo `spec-studio-app/notes-demo` (cloned to `/Users/Shared/spec-studio-demo/notes`, so no home folder name shows).

1. Build the test copy from the app repo: `OUT="$HOME/Library/Caches/Spec Studio/try/marketing" ./scripts/bundle.sh`.
2. Make its support folder with only the demo repo: `support/repos.json` with `[{"path": "/Users/Shared/spec-studio-demo/notes"}]`.
3. `swiftc -O -o windows windows.swift` (lists the window IDs of a process).
4. `./launch "TokyoNight Storm" <support folder> sessions` opens the copy at 1280×800 with a theme, on the demo spec. Its arguments override the app's settings without writing them, so the installed app keeps its theme.
5. `./shoot -dark` (or `./shoot ""` with a light theme such as "TokyoNight Day") points the reader at each section with `studio focus` and takes each window.
6. `./rec <seconds> <file.mp4>` records the window's area with ffmpeg.
7. Convert: `cwebp -q 82 -resize 1600 0 <shot>.png -o static/guides/<shot>.webp`.

`cap` and `rec` start `screencapture` and `ffmpeg` through Ghostty, because macOS refuses a capture from a Claude session inside Spec Studio, and Ghostty has the Screen Recording permission. The New Spec sheet and the Settings window need ⌘N and ⌘,: a person presses them, because the test copy shares its bundle ID with the installed app and a script cannot bring it to the front.

Before a shot or a clip goes in, check every frame for a private repo, spec or session name, an account name, or a path in a home folder.
