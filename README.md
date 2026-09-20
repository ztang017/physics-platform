# PhysicsLab 🔬

An interactive physics learning platform for introductory college and advanced high school students.
https://ztang017.github.io/physics-platform/#/

## Overview

PhysicsLab uses a **Predict → Observe → Explain (POE)** pedagogical cycle combined with gamified progression (XP, badges, levels) to help students build strong conceptual foundations in physics.

## Modules

| Module | Topic | Key Concept |
|--------|-------|-------------|
| 📈 Vector Kinematics Grapher | 1D Motion | Position, velocity & acceleration graphs |
| 🚀 Projectile Motion Sandbox | 2D Motion | Independence of horizontal/vertical motion |
| ⚖️ Free-Body Diagram Incline | Forces & Friction | Normal force, friction, weight decomposition |
| 💥 1D Elastic & Inelastic Collisions | Momentum | Conservation of momentum, coefficient of restitution |

## Tech Stack

- **React 18** + **TypeScript**
- **Zustand** — state management (XP, badges, POE phase)
- **Vite** — dev server + production bundler
- **KaTeX** — LaTeX equation rendering
- **Vitest** — unit testing for physics engines
- **PWA** — installable as a Progressive Web App

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run unit tests
npx vitest run

# Build for production
npm run build
```

## Project Structure

```
src/
├── core/
│   ├── physics/      # Pure physics engines (fully unit-tested)
│   └── store/        # Zustand stores (gameStore, sessionStore)
├── modules/          # One folder per simulation module
├── components/
│   ├── poe/          # Predict→Observe→Explain shell
│   └── ui/           # XPBar, BadgeDisplay, FormulaPanel, MathToggle
└── pages/            # Dashboard page
```

## Features

- **POE Cycle** — Structured predict, observe, explain workflow for every simulation
- **Live Math Mode** — Toggle between visual and mathematical (KaTeX) display
- **Graph-Match Mini-Game** — Adjust parameters to match a target velocity curve
- **Gamification** — XP, levels, and achievement badges
- **Slow-Motion Scrubber** — Frame-by-frame collision playback
- **PWA Support** — Works offline after first load
