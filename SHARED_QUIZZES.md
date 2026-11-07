# Friend-only link quizzes

The custom builder already writes `sharedQuizzes/{pushId}`, but the deployed database rules had no rule for this path. Every create was therefore rejected with PERMISSION_DENIED. This change adds only this missing rule block; all existing live rule nodes are structurally unchanged.

Authenticated accounts, including the feature's existing anonymous guest accounts, can create immutable link quizzes. The creator must match auth.uid and createdAt must be the server timestamp. Titles are 3–70 characters, questions 5–240, options 1–140. Exactly four numbered options are required and correct is an integer 0–3. Question indexes must form a contiguous 5–15 item list; unexpected fields and malformed/sparse records are rejected. Published quizzes cannot be overwritten or deleted by clients. No Auth providers, roles, payments or other user data are changed.

Visitors can read a known quiz ID without signing in. Collection enumeration is denied. Anyone with the link can inspect the shared questions, answers and technical creator ID; this is a casual friend quiz, not a secret-answer competition. Do not place confidential information in a shared quiz. No production quizzes or accounts are fabricated for verification.

The existing administrator Auth observer also sent every unsigned/anonymous visitor back to Home. An anonymous account created during publishing could therefore hide the successful link and filled form. It now redirects only when leaving a visible administrator panel; role checks, panel hiding and protected Firebase reads remain unchanged. Actual admin-panel logout is included in the browser test.

Validation: 51 local permission checks and 11 browser flows passed against demo Auth/RTDB. Coverage includes signed/guest creation, 5 and 15 questions, a separate unsigned visitor completing a shared link, accurate results, retry, visible success, retained form values, immutable records, schema bounds, collection privacy and administrator logout.

