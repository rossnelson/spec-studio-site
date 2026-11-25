#!/bin/sh
# After `bin/demo all video`: writes the files the site serves into static/video/.
# The MP4 is 1280x720 H.264, at most 40 MB (a 2-pass encode at a fixed bit rate).
set -e
cd "$(dirname "$0")"
OUT=../static/video
mkdir -p "$OUT"
ffmpeg -v error -y -i build/spec-studio.mp4 -vf scale=1280:720 -c:v libx264 -preset slow -b:v 1400k -pass 1 -an -f mp4 /dev/null
ffmpeg -v error -y -i build/spec-studio.mp4 -vf scale=1280:720 -c:v libx264 -preset slow -b:v 1400k -pass 2 \
  -c:a aac -b:a 128k -movflags +faststart "$OUT/spec-studio.mp4"
rm -f ffmpeg2pass-0.log ffmpeg2pass-0.log.mbtree
cwebp -quiet -q 80 -resize 1280 0 build/spec-studio-splash.png -o "$OUT/spec-studio-poster.webp"
node captions.mjs "$OUT/spec-studio.vtt"
ls -la "$OUT"
