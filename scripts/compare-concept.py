"""Puts a 1440 px screenshot of the page next to a design concept (R2.S2).

The concepts are 1024 px wide, so the script scales the screenshot to the
same width. Then each text size can be compared by eye as a share of the
page width.

Usage: python3 scripts/compare-concept.py <concept.png> <screenshot.png> <out.png>
The theme tests (tests/theme.spec.ts) save the screenshots as
desktop-1440-light.png and desktop-1440-dark.png, under test-results/.
"""
import sys

from PIL import Image, ImageDraw

concept_path, shot_path, out_path = sys.argv[1:4]
concept = Image.open(concept_path).convert("RGB")
shot = Image.open(shot_path).convert("RGB")
w = concept.width
shot = shot.resize((w, round(shot.height * w / shot.width)), Image.LANCZOS)
gap, label = 24, 28
out = Image.new("RGB", (w * 2 + gap, max(concept.height, shot.height) + label), (128, 128, 128))
out.paste(concept, (0, label))
out.paste(shot, (w + gap, label))
draw = ImageDraw.Draw(out)
draw.text((8, 8), "concept", fill=(255, 255, 255))
draw.text((w + gap + 8, 8), "build, scaled to the concept width", fill=(255, 255, 255))
out.save(out_path)
print(out_path)
