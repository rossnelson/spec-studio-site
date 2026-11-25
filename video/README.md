# The demo video

`project.mjs` is a `demo-video-tool` project. The site serves its output from `static/video/`.

- `clips/stages.webm`: the reader of the demo spec moving through Spec, Plan, Build and Check (`scripts/shots/rec`, while `studio focus` changes the section).
- `clips/relay-message.webm`: a message from Claude Code through the local relay arriving in the demo spec's session, and the answer. Cut so no other session's name shows.
- `transcripts.json`: the real `claude -p` runs against the relay (`--output-format stream-json`), replayed in a terminal on `stage.html`.
- The backends scene records the built site's backends guide.

Build:

```sh
npm run build
export MUSIC=<an instrumental bed, at least 3 minutes> PLAYWRIGHT_DIR=$PWD
<demo-video-tool>/bin/demo all video
video/publish.sh        # static/video/: the 720p MP4 (at most 40 MB), the poster, the captions
```
