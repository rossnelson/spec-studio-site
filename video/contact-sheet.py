#!/usr/bin/env python3
"""contact-sheet.py <video.mp4> <out dir> [fps]: every frame of the video at
<fps> frames a second (1 by default), each with its time, on sheets of 5x6
frames: <out dir>/sheet-01.png, sheet-02.png, ...

Read every sheet before you publish a video: look for blank paper, a broken
still, a private name or a path in a home folder. Needs ffmpeg and Pillow.
"""
import glob, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw

if len(sys.argv) < 3:
    sys.exit(__doc__)
video, out = sys.argv[1], sys.argv[2]
fps = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
COLS, ROWS, W, PAD = 5, 6, 384, 4

os.makedirs(out, exist_ok=True)
for old in glob.glob(os.path.join(out, 'sheet-*.png')):
    os.remove(old)
with tempfile.TemporaryDirectory() as frames:
    subprocess.run(['ffmpeg', '-v', 'error', '-i', video, '-vf', f'fps={fps},scale={W}:-2',
                    os.path.join(frames, '%05d.png')], check=True)
    files = sorted(glob.glob(os.path.join(frames, '*.png')))
    h = Image.open(files[0]).height
    per = COLS * ROWS
    for n in range(0, len(files), per):
        sheet = Image.new('RGB', (COLS * (W + PAD) + PAD, ROWS * (h + PAD) + PAD), 'gray')
        for i, f in enumerate(files[n:n + per]):
            frame = Image.open(f).convert('RGB')
            t = (n + i) / fps   # the frame at t shows the video from t to t + 1/fps
            draw = ImageDraw.Draw(frame)
            label = f'{int(t // 60)}:{t % 60:04.1f}'
            draw.rectangle((0, 0, 8 * len(label) + 8, 18), fill='black')
            draw.text((4, 3), label, fill='white')
            sheet.paste(frame, (PAD + (i % COLS) * (W + PAD), PAD + (i // COLS) * (h + PAD)))
        sheet.save(os.path.join(out, f'sheet-{n // per + 1:02d}.png'))
    length = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video],
                            capture_output=True, text=True).stdout.strip()
    print(f'{len(files)} frames on {-(-len(files) // per)} sheets, {length} s at {fps:g} a second, in {out}')
