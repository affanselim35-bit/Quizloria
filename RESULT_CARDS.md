# Downloadable result cards

Knowledge/standard-personality results, six classic character quizzes, the story collection, IPIP forms and the original reflection questionnaires now expose a result-card action. The existing standard result-share button opens the same flow.

`result-card.js` draws a **1080×1350 PNG** locally using Canvas and the existing Quizloria Q logo design. Cards contain the test title, actual score or computed character, a short summary, a fixed canonical site URL and a genre-appropriate qualifier. Research cards always include the unvalidated-translation/non-diagnostic limitation; reflection cards are not presented as clinical scales, and entertainment cards identify creative matching. Practice/speed knowledge summaries preserve their context.

Only explicit result fields are passed to the card component. Individual question/answer strings, email, account name, UID and arbitrary current-page query strings are not exported. Nothing is uploaded, stored on the server or automatically sent to an external app. The canonical URL is always `https://quizloria.com/`.

The preview dialog supports PNG download, a copyable result summary and native file sharing when the browser reports support. The PNG/File is prepared before the user taps Share, preserving the user gesture required by mobile browsers. Unsupported sharing retains download/copy. Cancellation and denied clipboard access have recoverable messages/manual selection. No native sharing is invoked by tests: APIs are stubbed.

Text wrapping and adaptive sizing handle long Turkish results and unbroken words while reserving a separate area for qualifiers. The dialog traps focus, temporarily marks underlying dialogs inert, handles Escape without closing the underlying test, restores focus and revokes its object URL on close. A stale asynchronous render cannot reopen a dismissed dialog. Account changes close an open preview.

Validation: `tests/result-card-browser.cjs` covers five renderer paths, true PNG download and dimensions, native file metadata, share cancellation, clipboard fallback, long text, privacy markers, nested-modal focus and cancelled rendering. Regression coverage includes the 95 free-catalog, 34 discovery and 40 result-ad checks. Generated example images are local output artifacts, not customer results.

