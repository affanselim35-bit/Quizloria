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

