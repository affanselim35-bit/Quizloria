# Asynchronous friend challenges

After a full normal-mode knowledge quiz, the result screen offers **Arkadaşına meydan oku**. The player reviews the public game-name/score disclosure before creating a link. A registered non-anonymous account is required for creating and accepting; there are no new auth providers, payment services, Functions or navigation tabs.

81 knowledge banks are supported. Personality, reflection, character, research, custom, mixed, practice, speed, earlier and closeup modes are intentionally excluded because their scoring/engine differs. Question order may differ, but every canonical question and answer set must match. A versioned snapshot retains invitations across future edits. Mapping checks require a complete one-to-one question match and the same answer key; mismatched old clients must replay.

## Data and permissions

- `asyncChallengeBanks/{edition}/{testKey}`: existing PUBLIC knowledge questions, answers, title and count; immutable editions. Do not put mystery answers or private material here. Reading a known edition is public; browser creation is trusted-admin only. The current edition is also fixed in `async-challenge-edition.js`.
- `asyncChallenges/{128-bit random hex ID}/meta`: public invitation game name, host correct count, count, edition, bank key, host technical UID and timestamp. No collection listing.
- `hostChoices`: immutable canonical choices, host-readable only. Rules recalculate the host score.
- `guest`: one immutable registered opponent's UID, name, canonical choices, correct count and server timestamp. Rules recompute score and bind identity/name to auth. Only host and opponent may read an existing guest record. Concurrent opponents race atomically for this single slot; only one wins.
- A host may delete the entire challenge, including the comparison. New attempts expire after seven days; expiration does not automatically delete data. No history, leaderboard, daily task or XP write occurs for guest attempts. Names and choices are not sent to analytics. Privacy page documents these records.

This is casual play: public test solutions can be looked up. Validated scores prevent arbitrary score fields, not external help or multiple accounts.

## Preparing/publishing a new edition

The checked-in `assets/challenge-banks-v*.json` is an explicit public snapshot. Update its edition and UI manifest together; retain editions already referenced by shared links. `node tools/prepare-challenge-banks.cjs <output.json>` produces a scoped multipath patch only; it performs no network requests. Publish only this new edition and the current pointer with the existing project session, after checking the edition does not exist with different content. Do not replace database root or any existing content banks. Deploy the appended `database.rules.json` after comparing currently deployed rules with the pre-change baseline. Existing monthly mystery, party and shared-quiz rules must remain unchanged.

## Verification

Run `node tests/async-challenge-core.cjs` (all 81 banks). Start Auth/RTDB emulators with `firebase.test.json` / `demo-quizloria`; run `node tests/async-challenge-rules.cjs`. Browser test uses Playwright, Edge via `QUIZLORIA_BROWSER`, cached compat SDK via `QUIZLORIA_SDK_DIR`, and the existing public release fixture via `QUIZLORIA_RELEASE_SEED`; run `node tests/async-challenge-browser.cjs`. It seeds and exercises emulator data only. Never create production sample challenges, players or attempts to verify deployment. Regression suites: shared-quizzes-rules, mystery-rules and rules.cjs.
