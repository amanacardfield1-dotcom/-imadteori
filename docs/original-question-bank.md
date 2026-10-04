# Original Question Bank: 2026-10

This is an independently authored edition, not a migration of a third-party question collection. The 26-group curriculum map informs breadth; no Sweden4 question, answer set, photo, or scene composition is an authoring input.

## Scope

- Original first batch: 156 questions and 52 diagrams, retained without replacement.
- Supplement: 52 independent questions and 26 new educational diagrams.
- Combined addition: 208 questions, at least six per existing curriculum group, and 78 distinct PNG diagrams.
- Editable diagrams: `backend/data/questionSceneRenderer.js` and `backend/data/questionExpansionRenderer.js`.
- Rules: 60; safety: 50; vehicle: 40; environment: 30; personal factors: 28.
- Simulation: 65 questions, quotas 32/16/7/5/5 retained.
- Practice: 40 questions; image practice: 40 different images from the original pool.

This release covers representative concepts, not every question or every concept of a 1660-item external collection. Group labels are not a claim of exhaustive coverage. Technical ABS/ESC operation, numerical accident statistics, and detailed first-aid procedures are intentionally not asserted without a suitable verified primary basis.

## Content Checks

Each authored record has a concept, four independent options, one answer key, an explanation, official URLs, a rule locator, and the source-check date. Calculations state their inputs. Scenario-specific reasoning is identified internally as an application/inference where appropriate.

Sources are Swedish primary authorities: Riksdagen, Transportstyrelsen, Trafikverket, Polisen, Naturvardsverket, Elsakerhetsverket and Stockholms stad. Local rules are identified as local in their questions. The reviewed rules include right-of-way/exit distinctions, bike crossing/passage distinctions, parking distances, railway signals, light-vehicle winter tyres, trailer licence versus technical limits, restraints, inspection and alcohol thresholds.

## Audit Boundary

The external inventory contains 1660 question occurrences in 26 mixed test groups, including 1437 occurrences with an embedded image. These are occurrence counts, not unique-concept or unique-image counts. An automated DOM pass found 1657 text/option fingerprints and three repeats. Different pictures can accompany identical text, so these repeats are candidates, not confirmed equivalent scenarios.

Candidate topic tagging is not a completed semantic review. The external image scenarios still require visual review; neither the first batch nor this supplement proves exhaustive coverage of that collection. The internal audit contains abstract topic labels and hashes only, not third-party questions, options, image URLs or downloaded images. Authoring uses separate abstract concept targets and Swedish primary references.

The `source_checked` marker records an assistant source review, NOT government endorsement, certification, a guarantee of 100% accuracy, or a substitute for a qualified instructor's independent review. Changes in law and official guidance require a fresh review. References remain internal and are not added to question screens.

## Checks and Reproduction

```powershell
cd backend
npm ci
node scripts/renderQuestionScenes.js
node scripts/seedOriginalBank.js
node --test data/originalQuestionBank.test.js
cd ../frontend
node --test src/teoriprov/engine.test.js src/practiceExam/originalBank.test.js
npm run lint
npm run build
```

The dry run does not initialize Firebase or write anything. Validation checks schema, coverage, canonical duplicates ignoring option order, review records, asset existence and image hash uniqueness. Those checks do not themselves prove legal correctness.

## Release

1. Review content and all diagrams, run checks and build Hosting.
2. Stage with `node scripts/seedOriginalBank.js --write` using the existing private backend environment.
3. Deploy the frontend and original assets to the configured Firebase project.
4. Include alongside existing banks with `node scripts/seedOriginalBank.js --include`.

Inclusion verifies the stored snapshot before an atomic additive settings update. Previous settings are retained in `questionBankV2/importRuns/items`. Previous questions, bank editions and all attempts remain. Reseeding preserves exposure counters and creation dates. Replacement activation is disabled. Imports over 400 records are staged in bounded batches; inclusion fails until the stored edition is complete.

Readers always retain active legacy questions without an edition and add only checked editions listed in `settings.included_editions` (with compatibility for `active_edition`). Staged editions are hidden. Simulation combines the existing `teoriprovBank` with enabled original editions. Image practice combines the existing sign bank with enabled original diagrams and removes repeated IDs/images per attempt. Existing sign-study content is unchanged. In-progress sessions can finish. Approved-user/admin access rules remain unchanged.
