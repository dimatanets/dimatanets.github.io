# Static portfolio content

The HTML includes the homepage cards, Read next links, all case text, captions and static images before JavaScript runs. Videos show their posters without JavaScript. Interactive viewers and video playback enhance that HTML.

After changing `data/cases.js` or a case's `FIGURES` array, run:

```sh
node scripts/build-static.cjs
```

Keep `llms.txt` consistent with the current case studies. It contains public facts and project links, not evaluator instructions. `Text overview` links point to it from the main pages.

All 15 HTML pages use `assets/js/analytics.js`, with the existing PostHog project and configuration. Do not add a second inline initialisation. Text and PDF downloads cannot run JavaScript and therefore do not independently generate PostHog page views.

Search indexing remains disabled. Every HTML page keeps `noindex, nofollow`. The Docker image loads `nginx.conf`, which adds `X-Robots-Tag: noindex, nofollow` to all responses, including PDFs and `llms.txt`. Crawling is allowed so clients can read the noindex directive and people or agents can fetch direct links.

If hosted outside this nginx image, configure the equivalent response header at that host. GitHub Pages does not apply this nginx file. Do not assume plain-text or PDF files carry the HTML meta directive. Verify the production response headers after deployment.

This preparation does not publish the local checkout. Do not remove noindex or add a search-indexing workflow: the owner explicitly wants the portfolio excluded from Google search.
