#!/usr/bin/env python3
"""Generate DP tutorial images from prompt files using OpenAI's image API."""

import sys
import base64
import re
from pathlib import Path
from openai import OpenAI

PROMPTS_DIR = Path(__file__).parent / "prompts"
IMAGES_DIR = Path(__file__).parent / "images"

def extract_prompts(filepath):
    """Extract prompt blocks and their output filenames from a prompt file."""
    text = filepath.read_text()

    style_bible = ""
    bible_match = re.search(
        r"---BEGIN STYLE BIBLE---\s*\n(.*?)\n\s*---END STYLE BIBLE---",
        text, re.DOTALL
    )
    if bible_match:
        style_bible = bible_match.group(0)

    parts = re.split(r"={40,}\n", text)

    prompts = []
    for i, part in enumerate(parts):
        if "STYLE BIBLE" in part and "PROMPT" not in part:
            continue

        header_match = re.search(r"PROMPT.*?->\s*(\S+\.png)", part)
        if header_match:
            filename = header_match.group(1)
            prompt_text = part[header_match.end():].strip()
            if i + 1 < len(parts):
                prompt_text += "\n" + parts[i + 1].strip()

            if style_bible:
                prompt_text = prompt_text.replace(
                    "---BEGIN STYLE BIBLE---\n"
                    "[Paste the full style bible from above here]\n"
                    "---END STYLE BIBLE---",
                    style_bible
                )

            prompts.append((filename, prompt_text))

    return prompts


def generate_image(client, prompt_text, output_path, size="auto"):
    """Call OpenAI image generation and save the result."""
    print(f"  Generating {output_path.name} at {size}...")

    response = client.images.generate(
        model="gpt-image-2",
        prompt=prompt_text,
        size=size,
        quality="high",
    )

    image_bytes = base64.b64decode(response.data[0].b64_json)
    output_path.write_bytes(image_bytes)
    print(f"  Saved: {output_path} ({len(image_bytes) // 1024} KB)")


def main():
    # A portrait page has to be asked for explicitly. Left on "auto" the model
    # tends to return landscape even when the prompt insists on portrait.
    args = sys.argv[1:]
    size = "auto"
    for flag in list(args):
        if flag.startswith("--size="):
            size = flag.split("=", 1)[1]
            args.remove(flag)
    sys.argv = [sys.argv[0]] + args

    if len(sys.argv) < 2:
        print("Usage: python generate_image.py <prompt_file> [image_name]")
        print()
        print("Examples:")
        print("  python generate_image.py prompts/house_robber.txt          # generate all images in file")
        print("  python generate_image.py prompts/house_robber.txt house_robber.png  # generate one specific image")
        print()
        print("Available prompt files:")
        for f in sorted(PROMPTS_DIR.glob("*.txt")):
            prompts = extract_prompts(f)
            images = ", ".join(name for name, _ in prompts)
            print(f"  {f.name}  ->  {images}")
        return

    filepath = Path(sys.argv[1])
    if not filepath.is_absolute():
        filepath = PROMPTS_DIR / filepath.name

    if not filepath.exists():
        print(f"File not found: {filepath}")
        return

    target_image = sys.argv[2] if len(sys.argv) > 2 else None
    prompts = extract_prompts(filepath)

    if not prompts:
        print(f"No prompts found in {filepath.name}")
        return

    if target_image:
        prompts = [(name, text) for name, text in prompts if name == target_image]
        if not prompts:
            print(f"Image '{target_image}' not found in {filepath.name}")
            return

    IMAGES_DIR.mkdir(exist_ok=True)
    client = OpenAI()

    print(f"Generating {len(prompts)} image(s) from {filepath.name}")
    for filename, prompt_text in prompts:
        output_path = IMAGES_DIR / filename
        generate_image(client, prompt_text, output_path, size)

    print("Done!")


if __name__ == "__main__":
    main()
