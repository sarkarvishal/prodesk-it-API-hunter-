# Dev-Detective 🔍

A client-side web app that looks up GitHub users and their repositories using the official [GitHub REST API](https://docs.github.com/en/rest). Built with vanilla HTML, CSS, and JavaScript — no frameworks — to demonstrate Promises, async/await, JSON parsing, and asynchronous DOM rendering.

**🔗 Live Demo:** [Add your deployed link here, e.g. Netlify / Vercel / GitHub Pages]

---

## Preview

![Dev-Detective screenshot](./assets/screenshot.png)

> Replace the image above with an actual screenshot or screen-recorded GIF of the app once deployed. Place the file at `./assets/screenshot.png`.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Notes](#notes)
- [License](#license)

---

## Features

### Phase 1 — Base MVP
- Search input with a responsive Profile Card component
- Async `GET` request to `https://api.github.com/users/{username}`
- Renders Avatar, Name, Bio, Join Date, and Portfolio URL
- Loading state shown while the request resolves
- Graceful "User Not Found" state on a 404 — the app never crashes

### Phase 2 — Data Expansion
- Endpoint chaining: fetches the user's `repos_url` after the initial profile load
- Renders the user's latest repositories as clickable links (open in a new tab)
- Custom `formatDate()` utility that converts ISO timestamps (e.g. `2023-01-25T12:00:00Z`) into human-readable dates (e.g. `25 Jan 2023`)

### Phase 3 — Battle Mode
- Toggle to reveal a second username input
- Queries both users simultaneously via `Promise.all()`
- Calculates each user's total stars (`stargazers_count`) across their repos
- Conditionally renders a green "Winner" card and a red "Loser" card based on the comparison

---

## Tech Stack
- HTML5
- CSS3 (custom properties, glassmorphism panels)
- Vanilla JavaScript (ES2017+ async/await, Fetch API)
- [GitHub REST API](https://docs.github.com/en/rest) — public read-only endpoints, no auth required (subject to GitHub's unauthenticated rate limits)

---

## Project Structure
```
.
├── index.html    # Markup and structure
├── style.css     # Styling and layout
├── app.js        # Application logic (fetching, rendering, state)
├── assets/       # Screenshots / media for this README
└── README.md     # This file
```

---

## Getting Started

No build step or dependencies required.

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/dev-detective.git
   cd dev-detective
   ```
2. Open `index.html` directly in a browser, or serve it locally:
   ```bash
   npx serve .
   ```
3. Enter a GitHub username (e.g. `octocat`) and search

---

## Notes
- Uses the unauthenticated GitHub API, which is rate-limited to 60 requests/hour per IP. For heavier use, consider adding a personal access token.
- Battle Mode requests up to 100 repos per user to ensure an accurate star-count comparison, while single-profile search limits to 5 repos per the base spec.

---

## License
All rights reserved. This project may not be copied, modified, or distributed without explicit permission from the author.
