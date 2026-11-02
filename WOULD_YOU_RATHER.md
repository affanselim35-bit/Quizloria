# Hangisini seçerdin?

The dedicated O mu Bu mu? tab contains 40 permanent dilemmas across four categories. Oyun Modları shows a routing card to this tab rather than a playable embedded game. Guests play without any database writes, sign-in, or simulated statistics. Registered accounts may vote once per question, then see live real totals. This is entertainment, not a representative survey.

The published IDs w01–w40 and their choice meanings are immutable. Add new IDs and extend the server allowlist for future questions; never recycle an existing ID. Category order is shuffled with no repeats within each deck.

`ratherVotes/{question}/{uid}` stores only 0 or 1. Rules reject anonymous accounts, impersonation, updates, deletions, invalid choices, unlisted questions and parent rewrites. Transactions avoid overwriting a vote from another tab. Results are readable only by registered participants who voted on that question. Individual technical account IDs and ballots are necessarily readable by those participants through the SDK, although no names, emails or profiles are rendered in the game. Do not describe this as anonymous/private voting. A future aggregate-only backend would require a trusted server; client-writable counters are intentionally not used.

No Auth provider, payment, existing content, membership or user-profile permissions change. Account switching invalidates pending requests and listeners. Network errors do not fabricate a vote or count. Guest choices are held in memory only.

Validation: `tests/rather-rules.cjs` and `tests/rather-browser.cjs` use the local demo Auth/RTDB emulators. No production votes, accounts, messages or real advertising impressions are created by these tests.

