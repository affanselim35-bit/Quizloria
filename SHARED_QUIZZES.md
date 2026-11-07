# Friend-only link quizzes

The custom builder already writes `sharedQuizzes/{pushId}`, but the deployed database rules had no rule for this path. Every create was therefore rejected with PERMISSION_DENIED. This change adds only this missing rule block; all existing live rule nodes are structurally unchanged.

Authenticated accounts, including the feature's existing anonymous guest accounts, can create immutable link quizzes. The creator must match auth.uid and createdAt must be the server timestamp. Titles are 3–70 characters, questions 1–240 with at least one non-whitespace character, options 1–140. Exactly four numbered options are required and correct is an integer 0–3. Question indexes must form a contiguous 5–15 item list; unexpected fields and malformed/sparse records are rejected. Published quizzes cannot be overwritten or deleted by clients. No Auth providers, roles, payments or other user data are changed.

The builder previously rejected fully filled short questions with the misleading generic message “Bütün soruları ve dört şıkkı doldur.” Short nonempty questions now save successfully, including numeric options. Invalid fields receive an exact question/option message, aria-invalid, focus and scrolling clear of the sticky navigation. Validation preserves all entered values and makes no publish request until complete.

Visitors can read a known quiz ID without signing in. Collection enumeration is denied. Anyone with the link can inspect the shared questions, answers and technical creator ID; this is a casual friend quiz, not a secret-answer competition. Do not place confidential information in a shared quiz. No production quizzes or accounts are fabricated for verification.

The existing administrator Auth observer also sent every unsigned/anonymous visitor back to Home. An anonymous account created during publishing could therefore hide the successful link and filled form. It now redirects only when leaving a visible administrator panel; role checks, panel hiding and protected Firebase reads remain unchanged. Actual admin-panel logout is included in the browser test.

Validation: local permission and browser suites run against demo Auth/RTDB. Coverage includes signed/guest creation, 5 and 15 questions, short complete prompts with numeric options, exact empty-question and whitespace-option feedback/focus, no writes for invalid forms, retained values, a separate unsigned visitor completing a shared link, accurate results, retry, visible success, immutable records, schema bounds, collection privacy and administrator logout.

