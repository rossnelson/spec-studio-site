# The critter poses

`critters/*.webp` were made with the Codex CLI (the `codex-images` skill), from the logo (`static/logo.png`) and a stage picture (`static/stages/build.webp`) as references:

```sh
sips -s format png ../../../static/stages/build.webp --out /tmp/build-ref.png
~/.claude/skills/codex-images/gen.sh /tmp/critters style.txt poses.txt 4 ../../../static/logo.png /tmp/build-ref.png
python3 -I ~/.claude/skills/codex-images/cutout.py /tmp/critters ../critters 720 webp
```

`style.txt` is the style block for every pose. `poses.txt` has one pose for each line, `name|what to draw`. To add a pose, add a line, run only that line, and check it against the others before it goes in.
