# Unscripted
### Your life. One scene at a time.

> A personal visual diary that turns your daily moments into silent film scenes. Every 7 entries automatically becomes a 1-minute cinematic episode of your life.

---

##  Features

- **One moment a day** — no journaling pressure, just one sentence
- **Silent film aesthetic** — every entry becomes a vintage cinematic scene
- **AI-generated illustrations** — powered by Pollinations.AI (completely free)
- **Weekly episodes** — every 7 scenes auto-stitch into a 1-minute episode
- **10 rotating daily prompts** — never the same question twice in a row
- **Fully private** — everything stored in your browser, no backend
- **Free to use** — no subscription, no paywall

---

##  How It Works

```
You type a moment
        ↓
Claude AI writes a cinematic scene title + image prompt
        ↓
Pollinations.AI generates a vintage illustrated image
        ↓
Saved to your diary with the date
        ↓
Every 7 entries → automatic 1-minute silent film episode
```

---

##  Tech Stack

| What | How | Cost |
|------|-----|------|
| Frontend | React + Vite | Free |
| Scene writing | Claude API | ~$0.001/entry |
| Image generation | Pollinations.AI | Free |
| Animation | CSS + JS | Free |
| Storage | localStorage | Free |

---

##  Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/Manaswini-Zagabathuni/unscripted.git
cd unscripted
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add your Claude API key
Create a `.env` file in the root folder:
```
VITE_CLAUDE_API_KEY=your_claude_api_key_here
```
Get your key from [console.anthropic.com](https://console.anthropic.com)

### 4. Run the app
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

##  Project Structure

```
unscripted/
├── src/
│   ├── App.jsx        ← full app (all pages + logic)
│   ├── main.jsx       ← react entry point
│   └── index.css      ← base styles
├── index.html
├── vite.config.js
├── package.json
├── .env               ← your API key goes here (never commit this)
├── .gitignore
└── README.md
```

---

##  Pages

| Page | Description |
|------|-------------|
| **Landing** | App intro with sign in / sign up |
| **Auth** | Username + password (no email needed) |
| **Diary** | Daily entry box + film reel of all scenes + episodes |
| **Settings** | Change password, delete account |

---

##  Important Notes

- Never commit your `.env` file — it's already protected by `.gitignore`
- Keep your repository **private** if your API key is anywhere in the source
- Pollinations.AI image generation takes **20–60 seconds** — this is normal
- All diary data is stored in **your browser only** — clearing browser data will erase entries

---

##  Future Ideas

- [ ] Export diary as a downloadable PDF zine
- [ ] Year in review — all 365 scenes in one scroll
- [ ] Custom art styles (watercolor, pixel art, ink sketch)
- [ ] Mobile app version

---

## Credits

Built with:
- [Claude API](https://anthropic.com) — AI scene writing
- [Pollinations.AI](https://pollinations.ai) — free AI image generation
- [React](https://react.dev) + [Vite](https://vitejs.dev) — frontend framework

---

*Unscripted — because the best moments in life are never planned.*
