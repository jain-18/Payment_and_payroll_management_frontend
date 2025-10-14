# Copilot Instructions for PaymentFrontend

## Project Overview
- This is an Angular project (Angular CLI v20.3.2) for a payment-related frontend.
- Source code is in `src/`, with main app logic in `src/app/`.
- Major components: `home-component` and `login-component` in `src/app/`.
- Entry points: `src/main.ts` (browser), `src/main.server.ts` (server-side rendering), and `src/server.ts` (Node server).

## Key Workflows
- **Start dev server:** `ng serve` (or `npm start` if configured)
- **Build for production:** `ng build`
- **Run unit tests:** `ng test`
- **Run e2e tests:** `ng e2e` (add your own e2e framework if needed)
- **Generate new component:** `ng generate component <name>`

## Project Structure & Patterns
- Components are in their own folders under `src/app/`, each with `.ts`, `.html`, `.css`, and `.spec.ts` files.
- Routing is defined in `app.routes.ts` and `app.routes.server.ts`.
- App configuration is split for browser/server in `app.config.ts` and `app.config.server.ts`.
- Styles: global in `src/styles.css`, per-component in their respective `.css` files.
- Use Angular CLI conventions for file naming and structure.

## Conventions & Integration
- Use Angular's dependency injection and module system for services and shared logic.
- Prefer Angular CLI for scaffolding and managing code structure.
- No custom build/test scripts—use standard Angular CLI commands.
- No nonstandard state management or cross-component communication patterns detected.
- No backend API integration code found in this repo (add details if/when present).

## Examples
- To add a new page: `ng generate component my-page` (creates folder and files in `src/app/`)
- To update routing: edit `src/app/app.routes.ts`

## References
- See `README.md` for more CLI usage and workflow details.
- Key files: `src/app/`, `angular.json`, `package.json`, `README.md`

---
If you add custom scripts, backend integration, or project-specific patterns, update this file to help future AI agents and developers.
