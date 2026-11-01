# Current public access policy

Premium sales and promotion are paused at the owner's request. **All 83 former Premium entries are now ordinary free tests**, including the 36 advanced quizzes, 20 IPIP reflection forms and 24 entertainment stories. The three original extra knowledge quizzes are free too. Existing free tests remain available.

The owner-controlled Realtime Database boolean `siteAccess/freeTests: true` grants public read access to the three authored-content banks. This control is publicly readable but cannot be changed by client accounts, including client admins. Content writes, administrator roles, memberships and user records retain their existing authorization checks. The former `premium*` data paths are internal compatibility names, not a requirement to subscribe.

The frontend waits for this policy before enabling extra-test launch buttons. In free mode it hides the Premium navigation entry, home/profile promotions and the pricing page, removes crown/lock badges and renders normal test cards. Old Premium navigation targets redirect to the common test list. The default CSS also hides promotions before the policy arrives, preventing a pricing flash.

Free knowledge progress uses `catalog:` IDs and the normal resume flow. Existing `premium:` and advanced favorites map to the current IDs. Story and research forms work without sign-in; their answer summaries and scientific limitations remain intact. No payment is taken. Existing trusted administrators retain ad-free access through the independent role-based membership state.

The parked paid-mode code remains for possible future work; it is not activated by this release. Any future change to the access policy must be explicitly authorized. Older paid-mode test fixtures omit the free-policy flag and therefore continue to check the parked gated behavior; current free-mode suites explicitly seed the flag to true.

Validation:

- `tests/free-catalog-rules.cjs`: all 83 authored tests readable as a guest, content writes and policy changes denied to clients, membership/admin privacy unchanged.
- `tests/free-catalog-browser.cjs`: all 83 tests opened with no account, no visible Premium promotion, complete story and research results, normal knowledge resume, legacy favorites and admin ad-free reload.
- Existing ad-layout, administrator and multiplayer/invitation checks cover surrounding flows.

This release changes only access to authored quiz content. It does not publish account records, grant roles, create subscriptions or charge customers.

