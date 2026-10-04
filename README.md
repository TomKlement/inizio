# Google search results

One search field. It shows the first page of organic Google results, and you can download them as JSON or CSV. Country and language can be switched. The default is google.cz in Czech.

Next.js (App Router), React, Tailwind, Vitest.

Results come from [Serper](https://serper.dev). Scraping Google isn't workable here: the results page is rendered with JavaScript, a server IP gets a captcha, and the markup changes.

## Run

Needs an API key from [serper.dev](https://serper.dev). Sign-up includes some free credits.

```bash
cp .env.example .env.local   # set SERPER_API_KEY
npm install
npm run dev                  # http://localhost:3000
```

Docker, same URL:

```bash
cp .env.example .env.local
docker compose up
```

The dev server runs in the container and the source is mounted from the host.

## Tests

```bash
npm test
```

## Deploy

Import the repo on [Vercel](https://vercel.com) and set `SERPER_API_KEY`. `/api/search` is cached on the CDN for an hour, so a repeated query doesn't spend another credit.
