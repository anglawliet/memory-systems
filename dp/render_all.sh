#!/bin/bash
# Generate every card whose prompt exists but whose image does not.
# Runs sequentially, skipping work already done, so it is safe to re-run
# after an interruption.
#
#   bash dp/render_all.sh            # fill in every missing image
#   bash dp/render_all.sh stairs lis # only these problem keys
cd "$(dirname "$0")/.." || exit 1

REF=dp/images/robber_one_call.png
LOG=dp/render.log

for prompt in dp/prompts/*_one_call.txt dp/prompts/*_code_and_script.txt; do
    [ -e "$prompt" ] || continue
    name=$(basename "$prompt" .txt)
    key=${name%%_*}

    if [ $# -gt 0 ]; then
        match=0
        for want in "$@"; do [ "$key" = "$want" ] && match=1; done
        [ $match -eq 1 ] || continue
    fi

    if [ -f "dp/images/$name.png" ]; then
        echo "skip  $name (already rendered)"
        continue
    fi

    echo "==> $name" | tee -a "$LOG"
    python3 dp/generate_with_reference.py "$name" --reference "$REF" >>"$LOG" 2>&1 \
        && echo "  done $name" || echo "  FAILED $name"
done

echo "all requested cards rendered"
