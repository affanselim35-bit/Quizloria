# Test discovery

The common test list has four type selectors: knowledge quizzes, entertainment characters, personal reflection and research-based self-assessment. Types are distinct from topic filters (science/culture, music/cinema/games and sports). Counts are computed from loaded cards, including the remote free catalog; no fixed marketing total is used.

The latest-release manifest in `discovery.js` lists the 24 character stories published on 2026-11-01. Six previews appear in a horizontally scrollable row, and “Tümünü gör” filters to all 24. Previews dispatch to the original test action, preserving server access policy and the appropriate renderer. Moved older advanced tests are not incorrectly included as new additions. Add the next release's IDs to this manifest when publishing new content.

Choosing a type clears the old topic/search/difficulty filters before showing that type. Search, topic, difficulty, favorites and the latest collection can then be combined. The preview row hides while filters/search are active so it does not contradict the displayed result count. A reset button restores the full list, and the empty-result state is visible when nothing matches. Type controls expose pressed state, and scrolling accounts for sticky navigation and reduced-motion preferences.

No test content, memberships, administrator roles, ad configuration or access policy changes are part of this update. Premium promotion remains paused and all former Premium tests remain free.

Validation: `tests/discovery-browser.cjs` checks all four types, current counts, six working previews, all 24 latest tests, combined filters, empty state/reset, favorites, no horizontal page overflow and view separation at 390px/1280px. The 95 free-catalog checks and 61 manual ad layout checks pass as regression coverage. Test fixtures serve `discovery.js` locally and block real ad requests.

