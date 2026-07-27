#!/usr/bin/env python3
"""Generate a DP diagram from a prompt file, using an approved poster as a style reference.

Style transfers far better from an actual image than from words, so the reference
image is passed to images.edit rather than described in the prompt.

Usage:
    python3 dp/generate_with_reference.py lcs_one_call
    python3 dp/generate_with_reference.py lcs_one_call --reference dp/images/lis_one_call.png

Reads  dp/prompts/<name>.txt
Writes dp/images/<name>.png

See MASTER_ONE_CALL_DIAGRAM_PROMPT.md for the full spec these prompts follow.
"""

import argparse
import base64
import re
import sys
from pathlib import Path

from openai import OpenAI

DP_DIR = Path(__file__).parent
PROMPTS_DIR = DP_DIR / "prompts"
IMAGES_DIR = DP_DIR / "images"

# The original LIS choice diagram that set the house style. Any approved poster
# from the same family works too.
DEFAULT_REFERENCE = Path.home() / "Downloads" / "ChatGPT Image Jul 26, 2026, 05_52_29 PM.png"
FALLBACK_REFERENCE = IMAGES_DIR / "lcs_one_call.png"


def extract_prompt(prompt_file):
    """Pull the prompt body out of a prompt file, after its 'PROMPT ... -> name.png' header."""
    text = prompt_file.read_text()
    header = re.search(r"PROMPT.*?->\s*(\S+\.png)\n=+\n", text)
    if not header:
        sys.exit(f"No 'PROMPT ... -> <name>.png' header found in {prompt_file}")
    return header.group(1), text[header.end():].strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("name", help="prompt file stem, e.g. lcs_one_call")
    parser.add_argument("--reference", type=Path, help="style reference image")
    parser.add_argument("--size", default="1536x1024", help="landscape by default")
    args = parser.parse_args()

    prompt_file = PROMPTS_DIR / f"{args.name}.txt"
    if not prompt_file.exists():
        sys.exit(f"Not found: {prompt_file}")

    reference = args.reference or DEFAULT_REFERENCE
    if not reference.exists():
        reference = FALLBACK_REFERENCE
    if not reference.exists():
        sys.exit("No style reference image available. Pass one with --reference.")

    target, prompt = extract_prompt(prompt_file)
    output = IMAGES_DIR / target

    print(f"Prompt:    {prompt_file.name} ({len(prompt)} chars)")
    print(f"Reference: {reference.name}")
    print(f"Output:    {output}")

    client = OpenAI()
    with reference.open("rb") as ref:
        # NOTE: gpt-image-2 rejects input_fidelity, so it is deliberately not passed.
        response = client.images.edit(
            model="gpt-image-2",
            image=[ref],
            prompt=prompt,
            size=args.size,
            quality="high",
        )

    if not response.data:
        sys.exit("No image returned.")
    data = response.data[0].b64_json
    if not data:
        sys.exit("No image data returned.")

    IMAGES_DIR.mkdir(exist_ok=True)
    output.write_bytes(base64.b64decode(data))
    print(f"Saved {output.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
