# Learning summaries

Knowledge results now show a per-attempt topic table, up to two related quizzes, and a comparison with the latest completed attempt of the same quiz and mode on this browser/account. Detailed editorial topics cover the refreshed general, logic and science banks (42 questions); other banks use their quiz subject rather than guessing subtopics. Mixed questions keep sourceTest provenance without overwriting institutional source URLs.

Comparison requires the exact same multiset of question texts, four options and correct indexes, plus equal length and mode. Shuffle order does not matter. Different/updated banks establish a new baseline. Old score-only history is not treated as comparable. Practice rounds never change the baseline. This is a quiz-round summary, not a general ability assessment.

Only a bounded device-local store (20 records per guest or signed-in account) is added. It contains quiz/mode, question-set identity, count, correct count and date, with no selected answers. It is not added to analytics or Firebase history sync. Storage denial leaves quiz play working and explains why comparison is unavailable. No Firebase rule or production user-data migration is required.

Validation: 29 logic checks; 40 mobile/desktop browser checks covering topic totals, suggested-quiz navigation, improvement/equal scores, reload, mode separation, changed questions, practice, full marks and unavailable storage. Answer-feedback, result-ad and result-card regression suites also cover the integrated result screen.
