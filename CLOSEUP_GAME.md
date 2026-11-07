# Yakından Bak

A visual guessing test in the common Testler catalogue, with search and difficulty/category filters. There is no separate navigation tab or game-modes card. The test opens in the standard play area and returns to Testler; ?game=closeup remains a compatible direct link. Guests can play without creating an account.

12 original AI-generated object photographs are packed into a single equal 3-column / 4-row PNG atlas under assets/closeup. The image loads only on explicit game start, is served from this site and requires no third-party image host or API key. Each crop stays inside its own cell. Answering reveals the full cell; neighbouring answers never appear in the crop.

The 12 visuals and four answer choices are shuffled each round. Correct unaided guesses earn 100 points; one optional wider crop plus text hint reduces the available points to 60. Wrong answers and skips earn zero. Answers lock after one action; advancing requires an explicit next click. A complete round has a maximum of 1200. The best completed score is bounded and saved locally only. Storage denial, image-load failure/retry and leaving/re-entering the tab are handled. No quiz history, Firebase writes, competitive scores, monthly awards, new analytics events or ad placements are added. As a public test it now participates in the daily challenge; reaching the final round summary signals completion without storing answers or adding its game score to rankings.

Images are synthetic game illustrations rather than documentary photographs. The image source is the original generated atlas; no stock photographs, brand artwork or external content was copied. Public note identifies AI-generated visuals.

Validation: 210 pure game/geometry checks; 183 browser checks at phone/desktop sizes cover the actual atlas, hint costs, correct/wrong/skip scoring, answer locks, finish/restart, navigation, retained local record, image-load retry and unavailable storage.
