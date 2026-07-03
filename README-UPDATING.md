# How to update this site

There is no build step. Every page loads its content from two files —
edit those, commit, and the live site updates in under a minute. 

## Add a new paper

Open `data/papers.json` on github.com (pencil icon to edit), copy an
existing entry, and change the fields:

```json
{
  "title": "Your New Paper Title",
  "authors": "with Coauthor A, Coauthor B",
  "status": "",
  "type": "working-paper",
  "tags": ["labor", "trade"],
  "pdf": "https://econgaurav.github.io/papers/YourFile.pdf"
}
```

- `type` is `"working-paper"` or `"publication"` — controls which
  "Status" filter tab it shows under.
- `tags` is a list — add as many topics as apply
  (`labor`, `development`, `migration`, `macro`, `education`, `crime`,
  `trade`). The paper will appear under every tag you list,
  automatically, with no need to duplicate the entry.
- `status` is free text shown under the authors — journal name, date,
  volume, whatever's relevant (e.g. `"Journal of Public Economics,
  245 105352, 2025"`). Leave it `""` for a plain draft with nothing to
  cite yet — the line just won't show.
- `pending: true` (optional) shows the status line in the accent color
  **and** sorts the paper above everything else on the page (use for
  R&R / conditionally accepted / forthcoming / under revision). Omit
  it once the paper is fully published.
- `abstract` (optional) replaces the placeholder text under "Abstract"
  with your real abstract.
- `featured: true` (optional) makes it eligible to show on the homepage.
- Upload the actual PDF to the `papers` repo/folder first, then point
  `pdf` at its `https://econgaurav.github.io/papers/...` URL.

This file is for research output only — op-eds, podcasts, and press
interviews go in `data/media.json` instead (see below).

Click "Commit changes" at the bottom of the GitHub editor. Done.

## Add a media mention, op-ed, or interview

All three live in `data/media.json`, distinguished by `category`:

```json
{ "year": "2026", "outlet": "NPR", "title": "Segment on migration policy", "url": "https://...", "category": "interview" }
```

- `category` is `"coverage"` (someone else wrote about your work —
  the default if you omit it), `"op-ed"` (something you wrote), or
  `"interview"` (a TV/radio/podcast appearance). This drives the
  Op-eds / Coverage / Interviews filter at the top of the Media page.
- Add new entries near the top (the page just groups by `year` in the
  order the file lists them, so keep it roughly newest-first).

## Update your CV or headshot

- CV: replace the PDF at `https://github.com/econgaurav/econgaurav.github.io/tree/main/papers/Gaurav_Khanna_CV.pdf` with your updated file (same filename, or update the CV link in each page's nav if you rename it).
- Headshot: add a photo named `headshot.jpg` to the `assets/` folder. The homepage looks for it automatically; if it's missing, the "GK" placeholder shows instead.

## Previewing changes before you commit

Opening `index.html` by double-clicking it won't load the data files
(browsers block that for local files). Either:
- Push to GitHub and preview at your Pages URL, or
- Run a local server from this folder: `python -m http.server`, then
  visit `http://localhost:8000`.
