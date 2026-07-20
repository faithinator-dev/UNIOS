# Project UNIOS — Frontend

This folder contains the UNIOS React frontend (Vite). I updated the UI to a modern, production-ready AI dashboard while preserving all existing functionality (Chat Brain, StudyBuddy, Codex Debugger, ELI5 Tutor).

Key UI enhancements:
- Glassmorphism, gradient backgrounds, and floating decorative elements
- Smooth transitions, staggered entrance, and micro-interactions
- Loading spinners, skeleton loaders, and typing indicators
- Sticky sidebar, responsive layout, and dark mode support
- Accessibility and semantic markup

Quick start

Install dependencies and run the dev server:

```bash
cd project-unios
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

Notes for deployment
- The frontend calls the UNIOS backend at `https://unios.onrender.com/chat` by default. For production, set your backend URL and ensure CORS and authentication are configured server-side.
- Serve the built `dist/` with a static host (Vercel, Netlify, Render, or any static file server) behind HTTPS.

Development details
- The app uses plain CSS in `src/index.css`. No Tailwind utilities are required for the updated UI.
- New reusable components live in `src/components/` and are lightweight and accessible.

Accessibility & performance
- Buttons and inputs include ARIA attributes and focus styles.
- Animations are CSS-only, hardware-accelerated where possible.
- Keep large responses paginated or chunked on the backend to avoid long blocking renders.

If you want, I can:
- Replace or remove Tailwind-related packages from `package.json`.
- Add a small e2e test to verify the four AI tools with mocked backend responses.

