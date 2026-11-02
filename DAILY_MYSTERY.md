# Günün Gizemi and monthly detective league

The Games view contains one scheduled fictional case each Istanbul day. A home shortcut and a profile card link to it. Registered accounts commit one immutable choice per day; correct answers earn 100 points, wrong answers earn 0 and consume the attempt. Guests may read clues and the public leaderboard but cannot submit. No advertisement placements change.

## Trusted scoring

Only `mysteryCases/{date}` is public after its opensAt timestamp. Answer keys in `mysteryKeys/{date}` are readable only after the current registered account has committed that date's immutable attempt. Future case reads and collection enumeration are denied. Authoring sources and the private seed stay outside the public repository. The first schedule runs from 2026-11-02 through 2027-01-31: 31 fictional cases rotate, with option order varied; the UI discloses the pool may repeat in later months.

Each attempt contains only choice and server timestamp. After locking, the client reveals the explanation and claims a score. Rules check the score against the pre-existing immutable attempt and secret answer key, validate the month and timestamp, and reject updates, extra fields, arbitrary scores, impersonation and altered names. The public monthly board contains game name, score and attempt time, keyed by technical account IDs. Attempts remain owner-readable; names and scores appear publicly only when the player participates. This prevents arbitrary point editing, but does not promise protection against multiple accounts or people sharing solutions.

Scores order by total descending, then the earliest timestamp at which that final total was reached, then a stable account order for exact timestamp ties. The UI states these rules. New months have separate boards. Server time and the Asia/Istanbul-equivalent UTC+03 day boundaries govern the schedule. A disconnected client cannot submit until reconnected; an in-flight submission may wait for acknowledgement. Reload/retry checks the saved attempt and repairs an interrupted score claim without another answer.

## Prize and settlement

A winner with at least one correct answer receives a permanent hall entry and, for the following calendar month, the Ayın Baş Dedektifi title, a gold profile border and access to three exclusive non-scoring bonus cases. There is no paid membership, cash prize, transfer or competitive advantage. Server-only entitlements control bonus reads; expired/revoked entitlements clear the UI and deny new reads. Previously viewed content cannot be recalled from a person's memory or saved copy.

`tools/settle-mystery.cjs` is the trusted administrative closer. It uses the existing Firebase CLI login with the explicit quizora-b1497 project and instance, replays immutable attempts against private keys, reconstructs scores (including interrupted claims), and settles only closed/unsettled seasons. It never trusts a browser's proposed winner. Empty/zero-point seasons have no winner. Existing awards are idempotent. It patches only mysteryScores, mysteryAwards and mysteryEntitlements; no accounts, roles, payments or other content change.

Default invocation is read-only; `node tools/settle-mystery.cjs --apply` performs allowed season closure. Fixture mode (`--fixture <file> --now <ms>`) cannot write production. Private temporary reads are removed without printing answer keys or credentials. Production deployment and creation of the recurring local check are awaiting explicit user approval after automatic approval review rejected both actions; no scheduled task has been created. The planned check needs this computer, the desktop app and project available; it is not a deployed always-on Cloud Function. If the machine/app is unavailable or credentials expire, prize delivery can be delayed until a successful retry. The calendar-month expiry is not silently extended. Content coverage below seven days triggers a maintenance notice.

Validation: 51 local permission/settlement checks and 16 responsive browser flows cover hidden answers, future access, one attempt, wrong answers, authentic scores, live spectator updates, reload repair, offline gating, bonus access/revocation and account switching. Existing free tests and the dilemma game remain available.

