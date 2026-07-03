# 48 media entries need a link

While migrating `media.json` from the live site, 48 of the 249 press
entries (out of 2017, 2018, and 2022) turned out to link only through
newsletter/tracking redirect URLs that have since expired (mostly a
2022 "pandemic mental health" press cluster and a 2018 "H-1B
innovation" cluster). Rather than invent a URL, those entries are in
the data file with a `"needs_review": true` flag and a `"note"`
explaining what's missing — they still display on the Media page
(outlet + title), they just aren't clickable yet.

To fix one: search the outlet's site for the article title, then add
a `"url"` field to that entry in `data/media.json` and delete the
`needs_review`/`note` fields.

Two entries (Bloomberg and Al Jazeera TV interviews, both 2017) only
ever linked to private Dropbox video files, not public pages — those
are flagged too; leave them as-is unless you have a public video URL
to swap in.

This is optional cleanup, not a blocker — the site works correctly
with these left as-is.
