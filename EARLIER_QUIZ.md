# Hangisi Daha Önce?

A two-choice knowledge quiz in the common Testler catalogue, with search/category/difficulty filters and a standard play/back flow. No navigation tab is added. The direct route is /?test=earlier. Twelve comparisons combine 18 sourced events from technology, gaming, space and Turkish history. Both question order and left/right choices shuffle each round.

One click locks the answer, reveals both dates, an original short explanation and two primary-source links. The next question requires an explicit click. Dates are hidden from the pre-answer UI. First public version, announcement, regional retail launch, launch into space and start of operations are named precisely. Where a source establishes only the year, the UI shows only that year; ordering compares date ranges and rejects overlapping/ambiguous ranges. The same-year LEGO/NASA and same-month Ankara/Republic questions require precise ordering.

Sources: Apple Newsroom, YouTube Blog, CERN, Google company history, PlayStation Blog, Xbox Wire, Microsoft history, Minecraft's official anniversary article, LEGO History, NASA mission/history pages, TBMM, the Ministry of National Education and Ankara Governorate. Event links and exact dates are stored in earlier-quiz.js. No images, audio, lyrics or third-party article passages are copied.

The completed test records one ordinary knowledge result (percentage score, correct/total counts and date), uses existing personal-best/result-card features, and completes the existing daily mission when selected. Revisiting the result does not duplicate history. No selected answers are persisted by this engine. It is included in the public daily pool, now 149; no Firebase rule, role or content-bank changes are needed.

Validation: 146 core/date/score-lock checks; 322 mobile/desktop browser checks across all 12 questions, two choices, reveal/source links, wrong answers, scoring, history exactly once and restart; 263 daily-engine checks across nine test families; 32 catalogue regression checks.
