# Playwright Tests for an Example Website

[![Playwright Tests](https://github.com/stefaniemehlich/playwright-example-tests/actions/workflows/playwright.yml/badge.svg)](https://github.com/stefaniemehlich/playwright-example-tests/actions/workflows/playwright.yml)

🔗 [Live demo](https://stefaniemehlich.github.io/playwright-example-tests/)

![Screenshot of the example website](docs/screenshot.png)

This is my first example project with Playwright: automated end-to-end tests for the draft of a website I built as part of another project. I used Claude Code as a pair-programming assistant while learning. Since this is only an example, there is no backend and no data is actually sent anywhere.

## At a glance

- 299 test cases in 12 test files, each run in Chromium, Firefox, and WebKit (897 test runs)
- TypeScript with type checking
- Shared helper functions in `tests/helpers/`
- ESLint with the recommended rules for JavaScript, TypeScript, and Playwright, plus a type-aware rule that catches missing `await`
- [GitHub Actions](https://github.com/stefaniemehlich/playwright-example-tests/actions): type checking, linting, and all tests on every push to `main` and on every pull request; on CI, failed tests are retried up to two times, and each run uploads the full HTML test report as a downloadable artifact (kept for 30 days)
- Every test case has a documented expected result; from these, a script generates
  the overview in [`dokuTestcases.md`](dokuTestcases.md)
- Developing the tests revealed several weaknesses on the page, e.g. contradictory
  details, duplicate content, and edge cases in the form, which were then fixed

**Note:** Test titles, expected results, and `dokuTestcases.md` are in German because the example website was designed for a German business. Identifiers and comments in the code are in English.

## What's tested

| Area | Test file | Content |
|---|---|---|
| "Check damage" form | `damage-form.spec.ts` | Validation of every field; when the error messages appear and change, the green border of the active field, character counter, file names; required fields and submitting, the values that are actually submitted; correcting, adding, and overwriting values; thank-you screen; closing and reopening the overlay |
| Floating buttons | `cta-float.spec.ts` | Visibility, position while scrolling, buttons do not cover the footer, WhatsApp link, "Check damage" button opens the form overlay |
| Gallery and reviews | `gallery.spec.ts`, `reviews.spec.ts` | Function of the arrows, infinite loop (with the progress bar or dots always showing the current position), automatic rotation; for the reviews also their content, the "… months ago" text, and that they are fully visible at different screen widths |
| Services | `services.spec.ts` | The first service is active on load, switching between services; each service has its own text (at least 50 characters) and background image |
| FAQ | `faq.spec.ts` | Expand/collapse on desktop and smartphone, keyboard navigation, no cut-off answers; every question has its own answer (at least 50 characters) and, on desktop, its own image |
| Navigation and footer | `navbar*.spec.ts`, `footer.spec.ts` | Internal and external links, logo scrolls back to the top, social links open in a new tab |
| Page in general | `homepage.spec.ts`, `images.spec.ts`, `seo.spec.ts` | Loads without errors, no horizontal scrolling, fade-in while scrolling, all images load (including lazy loading), SEO basics and structured data |

## Main focus: the damage form

The 223 tests in `damage-form.spec.ts` best show how I design tests:

- **Table-driven test data:** the validation of every field and other recurring
  cases (e.g. the character counter, combinations of required fields, the ways
  to close the overlay) are defined as tables. Each row is a test case, for the
  validation often with an input and an expected message.
  Adding a case takes only a new row, no new test code.
- **Boundary values:** e.g. 50 and 51 characters for the name field, 15 and 16
  digits for the phone number (with and without separators, since only digits
  count), 63 and 64 characters for one part of an email domain, 20 MB and
  20 MB + 1 byte for the upload.
- **Negative tests:** tests that deliberately enter invalid or missing values
  and expect an error are tagged `@negative-test`. They can be run on their own,
  or filtered in the HTML report (`@negative-test`, or `!@negative-test` for all
  other tests).
- **Flows:** combinations of required fields, adding missing information
  afterwards, correcting invalid values, several errors at once, submitting
  with the keyboard or straight from a field, reopening the form before
  submission (values and messages are kept) and after it (everything is reset).
- **What is actually sent:** some tests capture the values of all fields at the
  moment of submitting, e.g. to check that leading and trailing spaces are trimmed and that the
  values entered last are the ones sent.

## Classification (ISTQB)

Terms as used in the ISTQB Certified Tester Foundation Level syllabus v4.0.1.

- **Static testing:** static analysis with ESLint and the TypeScript type check,
  both run in CI before the tests.
- **Dynamic testing:** all Playwright tests.
- **Test level:** system testing. The whole page runs in a real browser and
  nothing is simulated; without a backend, the page is the entire system.
  System integration testing is out of scope: external links are intercepted
  and answered with a placeholder page.
- **Test types:** mainly functional and black-box testing (a few tests read values
  such as the auto-play interval from the source code). Some non-functional
  checks: no horizontal scrolling, image loading, keyboard navigation, and a
  visible focus border.
- **Regression testing:** the full suite runs in CI on every push and pull request.

| Test technique | Example in this project |
|---|---|
| Equivalence partitioning | one value per partition in the validation tables, e.g. umlauts, Cyrillic script, or an apostrophe in a name |
| Boundary value analysis | 50 and 51 characters for names, 15 and 16 digits for the phone number, 20 MB and 20 MB + 1 byte for the upload |
| Decision table testing | combinations of filled-in and missing required fields when submitting |
| State transition testing | overlay (closed → form → thank-you screen → closed → reopened), FAQ, sliders |
| Error guessing | "ë" pasted as two characters, Firefox treating an email field with only spaces as invalid |

Test cases are designed from the specified behavior. The source code was used
to find gaps (e.g. that only digits count for the phone number length), but code
coverage is not measured, so the white-box test techniques (statement and branch
testing) are not applied in the strict sense.

## Not (yet) covered

- **Mobile view:** currently only checked where behavior differs from desktop
  (FAQ, floating buttons, images, reviews). Full mobile coverage is missing.
- **Accessibility:** no automated check yet. The next step would be
  `@axe-core/playwright` for the homepage and the form.
- **Backend:** the page has none. There are therefore no API tests, no login,
  and no test-data management.

## Running the tests

Prerequisite: Node.js (LTS)

    npm ci
    npx playwright install
    npm test

Playwright automatically starts a local web server on port 8080 (or reuses
one already running there).

| Command | Purpose |
|---|---|
| `npm test` | all tests in all three browsers |
| `npx playwright test --project=chromium` | all tests in one browser only |
| `npx playwright test --ui` | view and run tests individually |
| `npx playwright show-report` | open the HTML report of the last run |
| `npx playwright test --grep @negative-test` | only the negative tests |
| `npx playwright test --grep-invert @negative-test` | all tests except the negative tests |
| `npx playwright test --grep "PLZ"` | all tests with a given text in their title (here: postal code) |
| `npm run lint` | run ESLint |
| `npm run typecheck` | run the TypeScript type check |
| `npm run writeDokuTestcases` | regenerate `dokuTestcases.md` |

## License

The Playwright tests and tooling (`tests/`, `scripts/`, configuration files) are
MIT-licensed — see [LICENSE](LICENSE), feel free to reuse them. The example
website itself (`index.html`, `images/`, its content and design) is
**not** covered by this license and may not be copied or reused.
