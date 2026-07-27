#!/usr/bin/env python3
"""Shrink the workshop PNGs in place without changing how they look.

The cards are flat marker style art, so a 256 colour adaptive palette is
visually indistinguishable from the 24 bit original while cutting roughly
three quarters of the bytes. That matters because GitHub Pages will not
resolve Git LFS objects, so these files have to live in the repo as ordinary
blobs, small enough to be reasonable.

    python3 dp/optimize_images.py --check          # report only
    python3 dp/optimize_images.py                  # rewrite in place
    python3 dp/optimize_images.py dp/images/a.png  # just these files

A rewrite is skipped when the palette version is not smaller, or when the mean
per channel error creeps above the threshold, so a photo dropped into these
folders is left alone rather than quietly degraded.
"""

import argparse
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).parent.parent
DIRS = ["dp/images", "graphs/images", "trees/images"]

COLORS = 256          # adaptive palette size
MAX_MEAN_ERROR = 6.0  # per channel, out of 255
MIN_SAVING = 0.10     # skip a rewrite that saves less than this fraction


def mean_error(a, b):
    # An RGB histogram is three 256 bin blocks laid end to end, so the bin
    # index has to wrap per channel rather than run 0..767.
    hist = ImageChops.difference(a, b).histogram()
    total = sum((i % 256) * n for i, n in enumerate(hist))
    return total / (a.width * a.height * 3)


def optimise(path):
    """Returns (path, before, after, note). after == before means untouched."""
    path = Path(path)
    before = path.stat().st_size
    try:
        with Image.open(path) as src:
            original = src.convert("RGB")
    except Exception as exc:
        return path, before, before, f"unreadable: {exc}"

    palette = original.quantize(colors=COLORS, method=Image.MEDIANCUT,
                                dither=Image.NONE)
    err = mean_error(original, palette.convert("RGB"))
    if err > MAX_MEAN_ERROR:
        return path, before, before, f"too lossy (mean error {err:.1f})"

    tmp = path.with_suffix(".png.tmp")
    palette.save(tmp, format="PNG", optimize=True)
    after = tmp.stat().st_size

    if after > before * (1 - MIN_SAVING):
        tmp.unlink()
        return path, before, before, "already small"

    # Prove the replacement is a readable PNG of the same size before it
    # overwrites the only copy on disk.
    with Image.open(tmp) as check:
        check.load()
        if check.size != original.size:
            tmp.unlink()
            return path, before, before, "size changed"

    tmp.replace(path)
    return path, before, after, f"mean error {err:.1f}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="*", help="default: every PNG in the image dirs")
    ap.add_argument("--check", action="store_true", help="report, change nothing")
    args = ap.parse_args()

    if args.files:
        targets = [Path(f) for f in args.files]
    else:
        targets = sorted(p for d in DIRS for p in (ROOT / d).glob("*.png"))

    total_before = sum(p.stat().st_size for p in targets)
    print(f"{len(targets)} files, {total_before / 1e6:.0f} MB")
    if args.check:
        return

    saved = skipped = 0
    with ProcessPoolExecutor() as pool:
        for path, before, after, note in pool.map(optimise, targets, chunksize=4):
            if after == before:
                skipped += 1
                print(f"  skip {path.name}: {note}")
            else:
                saved += before - after
                print(f"  {path.name:<44} {before / 1e6:5.2f} -> {after / 1e6:4.2f} MB")

    total_after = total_before - saved
    print(f"\n{total_before / 1e6:.0f} MB -> {total_after / 1e6:.0f} MB "
          f"({saved / total_before * 100:.0f}% smaller), {skipped} left alone")


if __name__ == "__main__":
    sys.exit(main())
