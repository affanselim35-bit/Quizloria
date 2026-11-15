# Test discovery

The common test list has four type selectors: knowledge quizzes, entertainment characters, personal reflection and research-based self-assessment. Types are distinct from topic filters (science/culture, music/cinema/games and sports). Counts are computed from loaded cards, including the remote free catalog; no fixed marketing total is used.

The separate New Arrivals section was removed at the owner's request. All 24 character stories remain in the normal common test grid, searchable and selectable through the same category/favorite filters. The legacy latest-action helper opens the full catalog instead of hiding older tests.

Choosing a type clears the old topic/search/difficulty filters before showing that type. Search, topic, difficulty and favorites can then be combined. A reset button restores the full list, and the empty-result state is visible when nothing matches. Type controls expose pressed state, and scrolling accounts for sticky navigation and reduced-motion preferences.

No test content, memberships, administrator roles, ad configuration or access policy changes are part of this update. Premium promotion remains paused and all former Premium tests remain free.

Validation: `tests/discovery-browser.cjs` checks all four types, current counts, no New Arrivals section, stories retained in the common catalog, combined filters, empty state/reset, favorites, no horizontal page overflow and view separation at 390px/1280px. The 95 free-catalog checks pass as regression coverage. Test fixtures serve scripts locally and block real ad requests.

## Compact browsing

The main Test türleri tiles are compact controls rather than tall intro cards. Both the main catalog and /testler/ initially show 12 matches, with 12 more per explicit click. Main search, type/topic/difficulty/favorite filters apply to the complete catalog before pagination; changing criteria resets the display limit. The directory has text search and a type selector, hides empty groups, and retains all ordinary links when JavaScript is disabled. Individual guides, questions and sources are unchanged. Pagination changes no scores or database content.
