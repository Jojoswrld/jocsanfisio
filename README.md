# JocsanFisio

Demo website for Jocsan Cruz Villalobos, a physiotherapist in La Fortuna de San Carlos, Costa Rica (Instagram [@jocsanfisio](https://www.instagram.com/jocsanfisio/)).

Spanish page for locals, English page for tourists. Plain HTML and CSS, published as a Cloudflare Worker that serves static files. The live site is marked `noindex`.

**Live:** https://jocsanfisio.arenalweb.workers.dev  
**English:** https://jocsanfisio.arenalweb.workers.dev/en/

## Pages and files

- `index.html` — Spanish (locals): home, gym, and online
- `en/index.html` — English (tourists): hotel and Airbnb visits
- `styles.css`, `tokens.css`, `base.css` — shared styles
- `warp.js` — navy background effect (Hallmark Garden theme, recoloured navy and orange)
- `RESEARCH.md` — market research and feature plan
- `archive/v1-OLD/`, `archive/v2-OLD/` — earlier versions, kept for reference

## Preview locally

There is no local dev script. Serve this folder with any static server, for example:

```bash
npx http-server -p 5178 -c-1
```

## Deploy

`npm run deploy` builds `dist/` (`node scripts/build.mjs`) and publishes it (`npx wrangler deploy`). The Worker settings are in `wrangler.jsonc` (`assets.directory` is `./dist`).

Still to fill in from Jocsan: hours, university and Colegio de Terapeutas license code, and a photo.
