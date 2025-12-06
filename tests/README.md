# End-to-end tests

This directory houses Playwright end-to-end tests for the Task Tracker app.

## Prerequisites

- Install dependencies: `npm install` from within this `tests` folder.
- (Optional) Install browsers: `npx playwright install` or `npx playwright install --with-deps`.
- Ensure the frontend (`npm run dev` in `frontend`) and backend (`npm run start:dev` in `backend`) servers are running before executing the tests.

## Useful scripts

- `npm test` – run the Playwright test suite headlessly.
- `npm run test:headed` – run in headed mode for debugging.
- `npm run test:ui` – open the Playwright test runner UI.
- `npm run codegen` – launch code generator to capture flows.

