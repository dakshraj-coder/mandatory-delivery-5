# Prompts Log - ENG-139055

## Prompt 1
You are assisting me with mandatory ticket ENG-139055: Ticket QR Code Generator Worker.

Read and analyze the following requirements carefully:

* This is an enterprise client deliverable.
* Core task: Ticket QR Code Generator Worker.
* Current phase: architectural planning and TDD preparation.
* Do NOT implement the production feature yet.
* Do NOT build the final UI yet.
* Do NOT create fake API integrations.
* Do NOT skip edge cases.

Requirements:

1. Users must be able to access the Ticket QR Code Generator Worker clearly.
2. Inputs should respond quickly.
3. Data must be structured consistently.
4. Empty states must display a user-friendly "No data found" message.
5. Asynchronous operations must have visible loading indicators.
6. Invalid or malformed form inputs must prevent submission and highlight offending fields in red.
7. Accessibility target is 100% Lighthouse accessibility.
8. Interactive elements need appropriate ARIA labels and keyboard navigation.
9. After a primary action is completed, log:
   [Analytics] User interacted with Ticket QR Code Generator Worker
10. Text inputs must be sanitized against XSS before being stored in application state.
11. The current technical deliverable is Database Schema + ERD + API Contracts.
12. No feature implementation should be produced at this stage.
13. The design system must be clean, monochromatic, corporate, with consistent 16px/32px spacing.
14. No real API keys or sensitive PII may be hardcoded.

TDD requirement:
Before implementation, create a comprehensive test plan and then create the test suite using the project's existing test framework. If no framework exists, recommend Jest or Vitest and explain the choice before installing anything.

The tests should cover:

* valid ticket creation
* missing required fields
* malformed input
* empty results
* loading states
* API/network failures
* QR generation
* nonexistent ticket
* invalid QR token
* expired QR
* revoked QR
* XSS sanitization
* analytics logging
* accessibility requirements
* keyboard navigation
* ARIA labels

First inspect the repository and determine its current structure and technology stack.

Then report:

1. What already exists.
2. What architecture you recommend.
3. Proposed database entities and relationships.
4. Proposed API endpoints and request/response contracts.
5. Recommended test structure.
6. Any ambiguities or decisions that need to be made.

Do NOT write production feature code yet.
Do NOT skip directly to implementation.

---

## Prompt 2
Good. The architecture and TDD plan are acceptable for the pre-implementation phase.

Now proceed to the TDD phase.

Important constraints:

* Do NOT implement production feature code yet.
* Do NOT build the final UI yet.
* Do NOT skip directly to making tests pass.
* Do NOT silently change the approved database schema or API contracts.
* Do NOT invent real API keys, credentials, or PII.

First:

1. Inspect the existing test files under `tests/`.
2. Inspect `package.json` and `vitest.config.ts`.
3. Ensure the test suite covers the requirements from ENG-139055.
4. Complete or correct the tests if necessary.
5. Ensure the tests are written BEFORE production implementation.
6. Run the complete test suite.

The tests must cover at minimum:

* Valid ticket creation
* Missing required fields
* Malformed input
* Empty ticket results
* Loading/asynchronous state
* API/network failure
* QR generation
* Nonexistent ticket
* Invalid/tampered QR token
* Expired QR token
* Revoked QR token
* XSS sanitization before state/storage
* Required analytics console message
* ARIA labels
* aria-invalid
* aria-describedby
* aria-live/status loading announcements
* Keyboard navigation
* User-friendly "No data found" empty state

Use Vitest as already planned.

If the tests fail because the production implementation does not exist, that is EXPECTED at this stage.

After running the tests, report:

1. Number of test files.
2. Number of tests.
3. Which tests pass.
4. Which tests fail.
5. Why the failures are expected before implementation.
6. Any problems in the test setup.

Do not implement production functionality yet.

Also create/update `PROMPTS.md` with the exact prompt I just gave you.

---

## Prompt 3
The TDD test suite is now established and the red phase has been recorded.

Proceed to the implementation phase for ENG-139055.

Important:

* Do NOT rewrite or weaken the existing tests simply to make them pass.
* Do NOT remove failing test cases.
* Treat the two failing sanitization tests as required acceptance criteria.
* Implement the minimum production code necessary to satisfy the existing tests and the approved architecture.
* Preserve the database schema and API contracts unless a genuine implementation conflict is discovered.
* Do not hardcode API keys, secrets, credentials, or PII.
* Keep all security-sensitive logic server-side where appropriate.

Implement the Ticket QR Code Generator Worker incrementally.

Prioritize:

1. XSS sanitization

   * Sanitize text before storing it in application state.
   * Handle script tags.
   * Handle iframe/object/embed content.
   * Handle inline event attributes.
   * Handle javascript: and dangerous URI schemes.
   * Correctly preserve legitimate Unicode/text content.
   * Correctly encode residual HTML-sensitive characters according to the existing tests.
   * Do not merely modify the tests to match the implementation.

2. Ticket validation and API behavior.

3. QR token generation and verification.

   * HMAC-SHA256 as specified by the architecture.
   * Nonce.
   * issued_at / expires_at.
   * Tamper detection.
   * Expiration.
   * Revocation.
   * Nonexistent ticket handling.

4. Worker/job behavior.

   * Idempotent processing.
   * Appropriate failure handling.
   * No application crash on simulated network/API failure.

5. UI behavior.

   * Loading state.
   * Empty state with "No data found".
   * Invalid fields highlighted in red.
   * Submission prevented for invalid data.
   * Analytics message:
     [Analytics] User interacted with Ticket QR Code Generator Worker

6. Accessibility.

   * Proper labels.
   * ARIA attributes.
   * Keyboard navigation.
   * Live loading/status announcements.
   * Accessible error messages.

Follow a small incremental loop:

* Implement one logical area.
* Run the relevant tests.
* Fix implementation issues.
* Run the complete Vitest suite.
* Do not change tests unless a test itself is objectively incorrect relative to the ticket requirements; if that happens, explain the reason before changing it.

At the end, report:

1. Files created/modified.
2. Implementation completed.
3. Test results before and after implementation.
4. Any remaining failures.
5. Any architectural decisions that changed.
6. Any security or accessibility concerns.

Also append this exact prompt to PROMPTS.md.

---

## Prompt 4
The implementation is now green with 35/35 tests passing.

Do NOT add new features yet.

Now perform a complete Definition of Done verification for ENG-139055.

Run the following checks against the actual repository:

1. TypeScript/build verification

   * Run the appropriate production type-check/build command.
   * Confirm there are no compilation errors.

2. ESLint

   * Run the project's lint command.
   * Require ZERO ESLint errors.
   * Require ZERO ESLint warnings.
   * Fix genuine lint problems in production code without weakening tests.

3. Test verification

   * Run the complete Vitest suite again.
   * Confirm 35/35 tests pass.

4. PROMPTS.md

   * Confirm PROMPTS.md exists at the repository root.
   * Confirm it contains the exact prompts used during the workflow.
   * Do not fabricate missing prompt history.

5. Security scan

   * Search the repository for hardcoded API keys, secrets, passwords, tokens, and real PII.
   * Confirm QR_SIGNING_SECRET is obtained from an environment variable.
   * Do not print or expose any secret values.

6. Browser/manual verification
   If a runnable UI exists, launch it and manually verify:

   * initial interface loads without fatal errors
   * valid input can be submitted
   * invalid/missing input prevents submission
   * invalid fields are visibly highlighted in red
   * validation messages are accessible
   * loading indicator appears during asynchronous operations
   * "No data found" appears for empty results
   * QR generation works
   * QR verification handles invalid/expired/revoked tokens
   * analytics message appears after successful primary action
   * keyboard-only navigation works
   * focus is visible
   * screen-reader relevant ARIA attributes are present

7. Lighthouse
   If the UI is runnable in a browser, run Lighthouse against the actual page and report the Accessibility score.
   Do NOT claim 100% Lighthouse accessibility merely because unit tests pass.

8. Git status
   Report:

   * current branch
   * modified files
   * untracked files
   * whether any generated or unnecessary files should be removed before commit.

Do not make architectural changes unless required to fix an actual DoD failure.

At the end provide a final ENG-139055 DoD checklist with:
PASS / FAIL / NOT VERIFIED

for every item.

Also append this exact prompt to PROMPTS.md.
