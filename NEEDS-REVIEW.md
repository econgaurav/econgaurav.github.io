# 16 media entries still flagged

Down from an original 48 after two cleanup passes (the 2022 "pandemic
mental health" cluster was consolidated into one entry with an
"Also covered by" list, and 14 other dead links across the site were
found working replacements via live search / Wayback Machine).

## 13 entries with no link at all (2018 "H-1B innovation study" cluster)

These outlets ran essentially the same story about a 2018 innovation
study, all originally linked only through expired newsletter tracking
redirects, and no live or Wayback copy could be found for any of them:
San Diego Union-Tribune, Dice Insights, UCSD News, CBS 8, Times of San
Diego, Fox 5 San Diego, Science Daily, EurekAlert, Eurasia Review,
ScienceMag, Domain B, State Science & Technology Institute. They still
display on the Media page (outlet + title), just aren't clickable.

## 2 entries confirmed genuinely gone (checked live + Wayback Machine, and against Gaurav's own CV document — no link anywhere)

- **Moms.com** (2020) — "Study Shows Affirmative Action Encourages Underrepresented Teens To Study Harder"
- **The Hindu** (2017) — "H-1B visas help uplift welfare of Americans: study" (thehindu.com appears to have blocked the Wayback Machine's crawler back when this ran, so no archive exists either)

## 2 entries that DO have a link, just a minor title caveat

- **Bloomberg** (2017) — "Trump's Immigration Ban Could Cost U.S. Colleges $700 Million"
- **Quartz** (2017) — "New research shows who will be hurt and helped if America's tech industry can't hire the world's best talent"

Both of these titles were reconstructed from the article's URL slug
rather than confirmed against the live rendered page (the pages
themselves weren't fetchable at extraction time). The links work; if
you want to double check the exact wording, click through once.

## To fix any of these

Search the outlet's site (or Google/Wayback Machine) for the article
title, then add a `"url"` field to that entry in `data/media.json` and
delete the `needs_review`/`note` fields. All optional — the site works
correctly with these left exactly as they are.
