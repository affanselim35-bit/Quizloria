# Premium research forms and character results

## What is implemented

Twenty **separate ten-item IPIP facet forms**, with 200 Turkish-translated items, official positive/reverse keys, five response options, complete-response scoring, answer-level explanations and source links. These are facets from one research inventory, not twenty independently validated Turkish instruments and not the complete IPIP-NEO inventory.

The original English facet scales have published comparison data. Quizloria's Turkish translations, separate administration and feedback text have **not** undergone Turkish validation or norming. This is stated before answering and in the result sources. No diagnosis, IQ score, percentile, population ranking, clinical cutoff or certification is generated. The neutral answer-scale midpoint (3) is explicitly distinguished from a population mean or diagnostic threshold.

The paid service is the presentation, explanation and ad-free experience; IPIP source materials themselves are public domain and available free. Actual payment checkout remains disabled until a provider is configured.

## The twenty facets

| ID | Form | IPIP facet |
| --- | --- | --- |
| ipip-e1 | İnsanlarla Yakınlık Kurma | Friendliness |
| ipip-e2 | Kalabalık ve Sosyal Ortam Tercihi | Gregariousness |
| ipip-e3 | Söz Alma ve Yön Verme | Assertiveness |
| ipip-e4 | Günlük Hareketlilik | Activity Level |
| ipip-e6 | Neşe ve Olumlu Duygular | Cheerfulness |
| ipip-o1 | Hayal Gücü ve Düşünsel Keşif | Imagination |
| ipip-o2 | Sanatsal ve Estetik İlgi | Artistic Interests |
| ipip-o3 | Duygularla Temas | Emotionality |
| ipip-o4 | Yeniliğe ve Deneyime Açıklık | Adventurousness |
| ipip-o5 | Düşünsel Merak | Intellect (interest, not IQ) |
| ipip-a1 | İnsanlara Güven Yaklaşımı | Trust |
| ipip-a3 | Yardım Etme Eğilimi | Altruism |
| ipip-a4 | Uzlaşma ve Çatışma Yaklaşımı | Cooperation |
| ipip-a6 | Şefkat ve Başkalarının Sıkıntılarına Duyarlılık | Sympathy |
| ipip-c1 | Görevlerde Yeterlik Algısı | Self-Efficacy |
| ipip-c2 | Düzen ve Plan Tercihi | Orderliness |
| ipip-c3 | Söz ve Sorumluluklara Bağlılık | Dutifulness |
| ipip-c4 | Hedefe Yönelme ve Çaba | Achievement-Striving |
| ipip-c5 | Başlama ve Öz Disiplin | Self-Discipline |
| ipip-c6 | Düşünerek Karar Verme | Cautiousness |

Every original facet retains all ten items. Positive and reverse items alternate in the UI, retaining the original key attached to each item. Five response options describe how accurately an item describes the person. Positive responses score 1–5; reverse responses score 6 minus the response. Raw totals range from 10 to 50 and item means from 1 to 5. Feedback explains the direction of endorsement without using invented normative bands.

## Sources and provenance

- Goldberg, L. R. (1999). *A broad-bandwidth, public domain, personality inventory measuring the lower-level facets of several five-factor models.* Personality Psychology in Europe, 7, 7–28. [Author-hosted chapter](https://www.ipip.ori.org/A%20broad-bandwidth%20inventory.pdf).
- [Official facet items and scoring keys](https://ipip.ori.org/newNEOKey.htm).
- [Original English facet comparison data](https://ipip.ori.org/newNEO_FacetsTable.htm). These coefficients must not be attributed to Quizloria's translation.
- [Official scoring instructions](https://ipip.ori.org/newScoringInstructions.htm).
- [Public-domain permission, including commercial use](https://ipip.ori.org/newPermission.htm).
- [IPIP guidance on interpreting norms](https://ipip.ori.org/newNorms.htm).

Source checked 2026-11-01. Translation provenance: Quizloria draft `quizloria-tr-draft-1`; not a pre-existing validated Turkish form. Original English wording is stored alongside each translated item for review.

## Data and access

Only public metadata belongs in `premiumCatalog`; it is shown alongside normal tests with a crown and Premium label. `premiumAssessments/{id}` contains private form content. It uses the same server-enforced active-membership or trusted-admin access check as the knowledge test bank. Client users cannot grant memberships or write forms.

The content seed and authoring file are kept outside the public website checkout. Do not add either private seed to this public repository. The twenty forms are built in the private authoring environment. Publishing deploys the updated rules and imports matching private content as well as deploying the renderer; tests themselves never write to production.

Answers remain in the renderer's memory, with no answer upload, localStorage, generic quiz progress save, leaderboard or history sync. Closing the form, changing accounts or losing Premium access removes its content and answers. Source links are fixed official URLs. Public source materials can still be accessed directly for free.

## Entertainment character tests

All six character quizzes (superhero, TV, film, fantasy, detective and games) now show a prominent character result, a “Neden bu karakter çıktı?” explanation, three actual chosen-answer examples and four preference-theme counts. Answer themes follow the meaning of the answer, so changing its screen position does not change its meaning. Character profiles are editorial fiction, **not** scientific personality measures. Equal closest profiles are named and the deterministic display order is disclosed.

## Verification

Use Auth and RTDB emulators with `demo-quizloria`. Never run these reset-based tests against production. Provide the external authoring seed path as `QUIZLORIA_RESEARCH_SEED`.

- `node tests/research-rules.cjs`: all twenty private reads, public catalog reads, trusted writes, free/expired denial, complete ten-item schema, reverse-key types and unknown-field rejection.
- `node tests/research-browser.cjs`: all twenty actual forms, all official reverse keys at the upper endpoint, lower and neutral endpoint checks, editing, account revocation, no local answer persistence, mobile layout, and six entertainment result flows at mobile and desktop widths.
- Existing Premium party, psychology and answer-feedback browser tests cover the surrounding flows.

All ads in local tests are mocked, and all users and purchases are fixtures. No real charge, ad impression or real-user invitation is created.

## Existing advanced knowledge tests

The 36 existing `qplus_1` through `qplus_36` tests (18 subjects × İleri/Uzman, 15 questions each, 540 question entries) use the protected `premiumTests` bank. Their public question-bank declaration and free cards are removed; only title/category/count metadata remains in the static page. The common test grid displays crown-tagged Premium cards with sports and entertainment categories preserved. The research forms remain distinct from these knowledge quizzes.

Legacy `startQuiz('qplus_N')` calls use the Premium fetch path. Old local progress records containing advanced question lists are discarded, and legacy favorites map to the new `premium:qplus_N` IDs. Daily challenges and free mixed/duel pools contain only free test IDs. Moved quizzes retain shuffled question order, normal/speed modes and correct-answer feedback. Membership revocation scrubs the active quiz. Prior public copies and repository history cannot be retroactively made private by this change.

The separate private advanced-bank seed is outside the website checkout. `tests/advanced-premium-rules.cjs` validates all 36 banks against server rules; `tests/advanced-premium-browser.cjs` covers all legacy routes, private loading, scoring, old-progress cleanup, favorites, categories, free pools and revocation. Supply its location via `QUIZLORIA_ADVANCED_SEED`. Payment checkout remains closed until a provider is configured.

## Trusted administrator access

Existing `admins/{uid} === true` accounts can use all Premium content and the ad-free experience without a subscription. This is a server-checked role, not a locally stored flag. The UI waits for both membership and role reads before deciding ad eligibility, labels the access as administrator access without a false expiry date, and watches role removal/account changes. No administrator role or subscription is created by this feature.

Local checks: `tests/admin-premium-rules.cjs` covers all three banks, true-only roles, blocked self-upgrade, revocation and ordinary subscriptions. `tests/admin-premium-browser.cjs` checks ad-free initial reload, knowledge/research/story access, expired subscription with valid admin role, revocation and sign-out.

