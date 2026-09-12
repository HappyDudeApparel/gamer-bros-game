# Prism Valley canonical references — MISSING, one manual step needed

This directory is the single canonical location for the Prism Valley /
Creek Crossing concept images that every visual comparison (calibration
diorama rounds, the Golden Slice audit, and all future Prism Kit visual
gates) is judged against.

**Verified fact:** no copy of these images exists anywhere in this
container or repository. A filesystem-wide search turned up nothing, and
this Claude Code session has no mechanism to pull bytes out of a prior
chat turn's image attachments. This is not a guess — it was checked
directly before writing this file.

## The one action needed

Save the two Prism Valley / Creek Crossing concept images from the chat
into this directory with these exact filenames:

```
references/prism-valley/concept-overview.png
references/prism-valley/concept-map-a-f.png
```

(Any lossless format is fine — `.png` is just the recommended default. If
the images already have more descriptive canonical names from earlier
audit turns, keep those names, but update `PRISM_KIT_HANDOFF.md` to match
so the next Claude window isn't guessing.)

Once these files exist, `npm run prism:doctor` will report `references: ok`
instead of `NONE`, and the M1 Overhang visual gate has something concrete
to compare against.

Do not fabricate or approximate these images. Do not proceed with a visual
approval for any asset without them.
