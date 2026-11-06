# JocsanFisio

Demo website for Jocsan Cruz Villalobos, physiotherapist in La Fortuna de San Carlos, Costa Rica (Instagram @jocsanfisio).

- `index.html`: Spanish page, aimed at locals (home, gym, online)
- `en/index.html`: English page, aimed at tourists (hotel and Airbnb visits)
- `styles.css`, `tokens.css`, `base.css`, `warp.js`: shared styles and the navy background effect (Hallmark Garden theme, recoloured navy and orange)
- `RESEARCH.md`: market research and feature plan
- `archive/v1-OLD/`, `archive/v2-OLD/`: earlier versions, kept for reference

Live demo (noindex): https://jocsanfisio.karabi-bots.workers.dev (Cloudflare Worker serving static files). Deploy updates with `npm run deploy` (copies the public files to dist/ and runs wrangler).

Plain HTML and CSS. To preview locally, serve the folder with any static server, for example:

```bash
npx http-server -p 5178 -c-1
```

Still to fill in from Jocsan: hours, university and license code, a photo, and whether he does hotel visits.
