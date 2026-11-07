# All-public-test daily challenge

The home challenge uses all public test engines, rather than TEST_IDS alone. Current inventory is 147: 48 built-in quizzes, 6 character quizzes, 83 publicly released remote knowledge/story/IPIP tests and 10 original reflection forms. User-created/private quizzes, mixed mode and standalone games are outside the pool. The list comes from the native registries and the loaded public server catalogue, so supported new public catalogue entries participate automatically.

Selection waits for access and metadata readiness; no temporary small-pool choice is shown during loading. A sorted-id daily rotation covers every entry once per pool-length cycle. Day boundaries use Europe/Istanbul. The selected public test is pinned on this browser for the day, survives reload and remains pinned when the catalogue expands. Removal/restricted access invalidates the pin. An already completed legacy daily quiz is preserved for the current day.

Each engine opens through its own entry point. Native quizzes use existing completed history; persona, story, IPIP and reflection engines signal completion only at their validated result stage. Non-scored completions store only day + opaque test id in a bounded 32-day local marker list. No answers, personality outcomes, assessment scores or new cloud records are stored by this feature. The existing daily mission still grants its one 100 XP reward, without awarding points for an assessment response or duplicating a claim on review/reload.

Loading failure is explicit; the button stays unavailable until the public list is ready. Visibility/focus and a one-minute refresh detect date changes. Old quiz history remains compatible. Clearing local history also clears the daily completion marker.

Validation: 20 date/rotation/canonical-id logic checks; 209 mobile/desktop browser checks cover all 147 pool entries, seven opening/completion paths, cancelled/unfinished tests, loading/error recovery, private marker contents, reload, Istanbul midnight and single mission reward. Existing catalogue, answer-feedback, result-insights and home-ad checks cover integration.
