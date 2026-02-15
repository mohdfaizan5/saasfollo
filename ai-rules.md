- use bun to install every package with shadcn packages unless requried with npm
- make sure you dont break the existing code
- use comments to explain the code, not everywhere atleast in complex functions and in start of the file to tell what this file does.
- make sure you write code understanding the bigger picture and how it fits into the whole application.
- always check what version of the package is already installed and use that version docs and api.

---

- check if there is a bun.lock file if there is use bun to install every package or shadcn packages unless required to use npm
- if there is uv.lock file use uv to install every package unless instructed otherwise to use pip
- make sure you dont break the existing code
- use comments to explain the code, not everywhere atleast in complex functions and in start of the file to tell what this file does.
- make sure you write code understanding the bigger picture and how it fits into the whole application.
- always check what version of the package is already installed and use that version docs and api.
- **Database Migrations**: Always create NEW numbered migration files (00001, 00002, etc.) in migrations/ folder. Never edit existing migrations unless they failed. Format: `00XXX_description.sql`
- **Changelog**: After making user-facing changes, update `src/data/changelog.ts` by adding a NEW entry at the TOP of the array. Categorize changes into `improvements`, `fixes`, and `patches`. Include version, date, title, and description. This powers the public `/changelog` route.
