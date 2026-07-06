# Portfolio + Decap CMS

A buildless, static portfolio. Content lives in small JSON files under `data/`
and is edited through a browser admin panel at `/admin`. No build step, no
database, no server to run — the pages render their content in the browser, and
the CMS just commits changes to your Git repo.

```
index.html            Homepage (renders from data/*.json)
work.html             Case-study page (work.html?slug=...)
assets/style.css      All styling
data/site.json        Name, hero, socials, email
data/experience.json  Experience rows
data/projects.json    Works + case studies
admin/                Decap CMS (the editing UI)
```

## 1. Put it on GitHub

Create a new repository and upload every file in this folder (keep the folder
structure). The default branch should be `main`.

## 2. Host it (free)

Connect the repo to **Cloudflare Pages** or **Netlify**. No build command and no
output directory — it's already static. Every push auto-deploys. You'll get a
free URL now, and can point a custom domain at it later.

## 3. Turn on the editor (`/admin`)

The admin panel needs permission to commit to your repo. Netlify Identity (the
old default) is deprecated, so use **DecapBridge** — free and made for exactly
this:

1. Sign up at <https://decapbridge.com> and connect your GitHub repo.
2. It gives you an `identity_url` and a `gateway_url`.
3. Open `admin/config.yml`, set `repo:` to `your-username/your-repo`, then
   uncomment the `git-gateway` auth block and paste those two URLs in.
4. Commit the change. Visit `https://your-site/admin`, log in, and you're editing.

Saving in the panel commits to your repo → your host redeploys → the site
updates. Adding a project = **Projects → add item**; removing one = delete the
item. Same for experience rows.

### Preview locally (optional)

```
npx decap-server        # in one terminal
# serve the folder in another, e.g.:
npx serve .             # then open http://localhost:3000/admin
```

`local_backend: true` is already set, so the panel talks to the local server and
writes straight to your files — no login needed while testing.

## Editing notes

- **Case studies** use a rich-text editor (headings, lists, quotes, images).
  Images you drop in upload to `assets/uploads/`.
- **Slug** is the URL of a project's page: `work.html?slug=your-slug`. Keep it
  lowercase with dashes.
- **Show on homepage** toggles whether a project appears in the grid (its page
  still exists either way).
- Case-study pages render in the browser, so they aren't pre-baked for search
  engines. If you ever want them pre-rendered for SEO, that's a small upgrade to
  a static-site generator (e.g. Eleventy) — the content files stay the same.
