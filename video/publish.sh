#!/bin/sh
# publish.sh [relay]: after `bin/demo all video` (or `bin/demo all video/relay`),
# writes the files the site serves into static/video/: the MP4, the poster and
# the captions. The MP4 is 1280x720 H.264 (a 2-pass encode at a fixed bit rate).
# It runs check-frames.mjs first, and publishes nothing when the check fails.
set -e
cd "$(dirname "$0")"
DIR=.; NAME=spec-studio
if [ "$1" = relay ]; then DIR=relay; NAME=spec-studio-relay; fi
# check-frames.mjs exits 3 when the video has blank paper, and 1 when it cannot run.
node check-frames.mjs "$DIR" || {
  if [ $? = 3 ]; then echo "publish.sh: $(cd "$DIR" && pwd)/build/$NAME.mp4 fails the frame check, so nothing is published. See $(cd "$DIR" && pwd)/build/contact-sheet.png." >&2
  else echo "publish.sh: the frame check could not run (see its error above), so nothing is published." >&2; fi
  exit 1
}
OUT=$(pwd)/../static/video
mkdir -p "$OUT"
cd "$DIR"
ffmpeg -v error -y -i "build/$NAME.mp4" -vf scale=1280:720 -c:v libx264 -preset slow -b:v 1400k -pass 1 -an -f mp4 /dev/null
ffmpeg -v error -y -i "build/$NAME.mp4" -vf scale=1280:720 -c:v libx264 -preset slow -b:v 1400k -pass 2 \
  -c:a aac -b:a 128k -movflags +faststart "$OUT/$NAME.mp4"
rm -f ffmpeg2pass-0.log ffmpeg2pass-0.log.mbtree
cwebp -quiet -q 80 -resize 1280 0 "build/$NAME-splash.png" -o "$OUT/$NAME-poster.webp"
cd - >/dev/null
node captions.mjs "$DIR" "$OUT/$NAME.vtt"
ls -la "$OUT"
