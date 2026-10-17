# Utilități

Aplicație web (PWA) în română pentru evidența plăților la utilități: salvezi luna, suma și tipul utilității, apoi vezi grafice pe diferite perioade. Se instalează pe iPhone din Safari și funcționează offline.

Datele rămân doar pe telefon (localStorage). Din **Setări** poți exporta/importa un backup JSON.

## 1. Rulare pe laptop (Windows 10)

1. Instalează [Node.js LTS](https://nodejs.org) (versiunea 20 sau mai nouă).
2. Dezarhivează proiectul, deschide un terminal în folder (în VS Code: Terminal → New Terminal).
3. Rulează:

```
npm install
npm run dev
```

4. Deschide adresa afișată (de obicei http://localhost:5173) în browser.

Pentru a testa pe iPhone în aceeași rețea Wi-Fi, deschide în Safari adresa `Network` afișată de Vite (ex. `http://192.168.x.x:5173`). Instalarea ca aplicație (offline) funcționează doar după publicare, pentru că cere HTTPS.

## 2. Publicare gratuită pe GitHub Pages

1. Creează un cont pe github.com și un repository nou, de exemplu `utilitati` (poate fi public sau privat, în funcție de planul tău GitHub; Pages pe repo privat cere plan plătit, deci alege **public**. Nu conține date personale, pentru că sumele rămân doar pe telefon).
2. Încarcă proiectul (fără `node_modules`):

```
git init
git add .
git commit -m "Prima versiune"
git branch -M main
git remote add origin https://github.com/NUMELE-TAU/utilitati.git
git push -u origin main
```

3. Pe GitHub: **Settings → Pages → Source: GitHub Actions**.
4. După 1-2 minute (tabul **Actions** arată progresul), aplicația e la `https://NUMELE-TAU.github.io/utilitati/`.

Alternativ, la Netlify: „Add new site → Deploy manually" și tragi folderul `dist` generat de `npm run build`. Pe Netlify nu e nevoie de nicio configurare suplimentară.

## 3. Instalare pe iPhone

1. Deschide adresa publicată în **Safari** (nu în Chrome).
2. Apasă butonul **Partajare** (pătrat cu săgeată în sus).
3. Alege **Adaugă pe ecranul principal** → **Adaugă**.
4. Pornește aplicația din iconița nouă. Datele din aplicația instalată sunt separate de cele din Safari, așa că folosește doar iconița.

Important: fă un backup din **Setări → Exportă backup** din când în când și salvează fișierul în Fișiere / iCloud. Dacă ștergi aplicația de pe ecranul principal, datele locale se pierd.

## Structura proiectului

- `src/App.jsx`: navigarea și starea aplicației
- `src/components/`: formular, istoric, grafic, setări
- `src/storage.js`: salvare locală, validare, export
- `src/utils.js`: formatare (lună, RON), perioade
- `vite.config.js`: configurarea PWA (manifest, service worker)
