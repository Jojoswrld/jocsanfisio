# JocsanFisio

Demo website for Jocsan Cruz Villalobos, physiotherapist in La Fortuna de San Carlos, Costa Rica (Instagram @jocsanfisio).

- `index.html`: Spanish page (main)
- `en/index.html`: English page
- `styles.css`, `tokens.css`, `base.css`: shared styles (Hallmark Ink theme, recoloured navy and orange)
- `RESEARCH.md`: market research and feature plan
- `archive/v1-OLD/`: first version, kept for reference

Live demo (noindex): https://jocsanfisio.karabi-bots.workers.dev (Cloudflare Worker serving static files). Deploy updates with `npm run deploy` (copies the public files to dist/ and runs wrangler).

Version 3 (Garden design, Spanish only) is live separately at https://jocsanfisio-v3.karabi-bots.workers.dev, deployed with `npm run deploy:v3`.

Plain HTML and CSS. To preview locally, serve the folder with any static server, for example:

```bash
npx http-server -p 5178 -c-1
```

Still to fill in from Jocsan: hours, university and license code, a photo, and whether he does hotel visits.
