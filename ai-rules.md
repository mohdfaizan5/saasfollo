- use comments to explain the code, not everywhere atleast in complex functions and in start of the file to tell what this file does.
- make sure you write code understanding the bigger picture and how it fits into the whole application.
- always check what version of the package is already installed and use that version docs and api.
- check if there is a bun.lock file if there is use bun to install every package or shadcn packages unless required to use npm
- make sure you dont break the existing code

- **Database Migrations**: Always create NEW numbered migration files (00001, 00002, etc.) in migrations/ folder. Never edit existing migrations unless they failed. Format: `00XXX_description.sql`
- **Changelog**: After making user-facing changes, update `src/data/changelog.ts` by adding a NEW entry at the TOP of the array. Categorize changes into `improvements`, `fixes`, and `patches`. Include version, date, title, and description. This powers the public `/changelog` route.

- while writing git commmit messages, give a quick and short summary and details below

----

## Code rules

1. always also deal with errors gracefully, for example write the code assuming an error also could come when performing db queries or api fetch or something like that, show full error log and a end user friendly error message in console and also return a end user friendly error message to client and show that message