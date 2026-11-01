# Local checks

These checks use a demo Firebase project and never write to the production database. Java 21+ and Node.js 20+ are required.

In the repository directory, start the local services:

```sh
npx -y firebase-tools@latest emulators:start --only database,auth --project demo-quizloria --config firebase.test.json
```

In a second terminal:

```sh
node tests/rules.cjs
```

This checks request privacy, send/retry/cancel/decline/accept/unfriend, concurrent seat claims, capacity, host permissions, complete five-player matches, immutable answers, and departures.

For the browser flows, install Playwright locally and its Chromium browser, then run:

```sh
npm install --no-save playwright
npx playwright install chromium
node tests/browser.cjs
```

The browser test serves a temporary local fixture with Firebase Auth and Database emulators. It creates six isolated browser accounts and checks the social lifecycle, a ten-question five-player match, two-player timeouts, disconnected players, host departure, and mobile overflow. It resets only the local demo database. Do not run the two suites simultaneously.

Optional environment variables: `QUIZLORIA_BROWSER` selects a browser executable, `QUIZLORIA_SDK_DIR` uses locally cached Firebase 10.14.1 compatibility scripts, and `QUIZLORIA_SCREENSHOTS` selects the screenshot directory. Generated screenshots are not source files.

## Psychology question screens

With Playwright installed, `node tests/psychology.cjs` checks all 80 questions at mobile and desktop widths, including 320 question screens and all ten questionnaires' mixed, resource-focused, and difficulty-focused summaries. It verifies four visible, distinct, question-specific choices, explicit selection before continuing, back navigation, accurate counts, evidence quoted from actual selections, editable results, result headings clear of navigation, and no horizontal overflow. This suite uses a local page fixture, never signs in, and never writes to Firebase; running emulators are not required.

## Immediate knowledge-answer feedback

`node tests/answer-feedback.cjs` checks normal quiz feedback at mobile and desktop widths: hidden answers before confirmation, correct/wrong styling and text, locked choices, score consistency, restoring a revealed answer after reload, last-question review before results, wrong-answer practice, unchanged personality navigation, mixed tests, timer expiry and paused timers while reading feedback. It uses only a local fixture and never signs in or writes to Firebase. Explanations appear when question content supplies one or a matching built-in explanation exists.

## Manual homepage ad

`node tests/home-ad.cjs` uses a fake AdSense SDK and blocks real advertising requests. It checks 360px, 390px, 768px and 1280px layouts, placement outside the daily challenge card, inline responsive heights, visibility only on the homepage, one initialization across navigation, and unfilled / ad-blocker behavior. It does not create real ad impressions or clicks. Other browser fixtures also block third-party ad traffic.

The inline banner sizes follow Google's supported responsive-code modifications: https://support.google.com/adsense/answer/9183363?hl=en . The global AdSense loader remains included only once. Auto Ads must remain disabled in the AdSense account to preserve manual-only placement.

## Result-screen ad

`node tests/result-ad.cjs` uses a fake SDK to verify the separate test-result slot after knowledge, personality and psychology results, below all explanations and controls. It checks hidden question/edit screens, independent homepage and result slots, SDK loading before/after reaching results, responsive sizes, duplicate prevention and unfilled behavior. The shared controller detaches uninitialized units until the SDK and visible view are ready so a hidden unit cannot consume another slot's initialization.





