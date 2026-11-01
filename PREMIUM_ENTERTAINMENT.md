> Current status: Premium promotion/sales are paused. All authored tests are free under the public access policy. See [FREE_CATALOG.md](FREE_CATALOG.md). The paid-mode sections below document the parked implementation.

# Premium character and entertainment pack

Release content: **24 new story quizzes, 12 scenarios each, eight outcomes each** (288 question screens and 192 editorial outcomes). The six existing free character quizzes remain free. Checkout remains disabled until a payment provider is configured.

| Test | Theme |
| --- | --- |
| Hangi Anime Kahramanısın? | Anime journey |
| Hangi Büyücülük Okulu Karakterisin? | Magic school |
| Orta Dünya Yolculuğunda Kimsin? | Fantasy journey |
| Hangi Element Ustası Karakterisin? | Element adventure |
| Hangi Galaksi Kahramanısın? | Galaxy exploration |
| Hangi Animasyon Kahramanısın? | Animation adventure |
| Hangi Animasyon Dostusun? | Animated friendship |
| Hangi Pokémon Yol Arkadaşısın? | Exploration and friendship |
| Mistik Akademide Hangi Karaktersin? | Original magic academy |
| Bir Dizide Hangi Başrolsün? | Original neighborhood drama |
| Gizemli Adada Hangi Karaktersin? | Island mystery |
| Zombi Hikâyesinde Hangi Rol Sensin? | Non-graphic comic adventure |
| Uzay Mürettebatında Kimsin? | Original space crew |
| Korsan Tayfasında Hangi Karaktersin? | Comic pirate journey |
| Ejderha Krallığında Hangi Karaktersin? | Original dragon kingdom |
| Gizli Ajan Ekibinde Kimsin? | Original spy comedy |
| Bir Dedektif Romanında Kimsin? | Nonviolent literary mystery |
| Oyun Evreninde Hangi Sınıfsın? | Original role-playing game |
| Siberpunk Şehrinde Hangi Karaktersin? | Original neon city |
| Bir Müzik Grubunda Hangi Karaktersin? | Original band journey |
| Bir Komedi Dizisinde Kimsin? | Original apartment comedy |
| Süper Gücün Hangisi Olurdu? | Original superpower academy |
| Hangi Efsanevi Yaratıksın? | Original mythical forest |
| Kendi Masalında Hangi Kahramansın? | Original fairy tale |

## Matching and feedback

Each answer has a semantic theme: analysis/planning, connection/support, action/initiative or curiosity/creativity. Options rotate by scenario while retaining their assigned theme. Each story has eight distinct editorial profiles with normalized four-theme weights. The player's twelve-answer distribution is compared with these profiles using squared distance; the nearest profile is displayed. Ties are named, and stable display order is disclosed. The authoring check enumerates all possible twelve-answer count distributions and verifies that each of the eight outcomes is reachable.

Questions use story-specific goals, objects, companions, obstacles and locations. The pack has 288 distinct prompts and 1,146 distinct choice strings out of 1,152 choices. This count is content QA, not a claim of independent psychometric constructs.

Results prominently show the character, its editorial interpretation, “Neden bu karakter çıktı?”, three actual selected-answer examples and optional theme counts. Users can review answers, replay from a clean state or close with Escape. These are **entertainment quizzes**, not scientific personality, intelligence or diagnostic tests. Character descriptions are creative interpretations, not claims of canonical or psychological measurement accuracy.

## Access and privacy

Public `premiumCatalog` entries have `kind: story-persona`, `category: fun`, and `count: 12`. They appear in the common test grid with crown badges, search/category controls and a scenario-test filter.

Actual questions and outcomes live in the protected `premiumStories/{id}` bank. Reads require active server-owned Premium membership or an existing trusted administrator role; writes require the trusted admin role. Rules enforce twelve complete scenarios, four choices and a permutation of theme IDs, eight complete profiles and integer profile weights summing to ten. Unknown fields and invalid array keys are rejected.

The public renderer (`premium-stories.js`) contains no authored bank. The private seed and authoring generator stay outside this public repository. Answers remain in memory and are not uploaded, saved as quiz progress, added to leaderboards or written to localStorage. Closing or losing membership/account access removes the overlay and its session. Local browser checks use a fake ad SDK only.

## Verification

With local Auth/RTDB emulators and `QUIZLORIA_STORIES_SEED` pointing to the external private seed:

- `node tests/stories-rules.cjs`: 182 schema/access checks, including every bank, free/guest denial, member access, invalid scoring keys, incomplete profiles and expiry.
- `node tests/stories-browser.cjs`: all 24 quizzes and 288 question screens, eight outcome patterns, actual answer evidence, locked free access, editing/replay, Escape, filters, memory-only answers and membership expiry.
- Existing Premium invitation/rematch checks cover the surrounding flow.

The complete private release bundle now contains 83 catalog entries: 39 knowledge quizzes, 20 research forms and 24 entertainment stories. Deployment imports only the catalog and three protected content banks. It does not create memberships or change existing user data.

