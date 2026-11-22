# gate-run.md — THE GILDED HOUR (best-heist-game-20261122-0559)

Builder run: 22 Nov 2026, ~14:50–15:20 WITA. Entry: **THE GILDED HOUR**.
Repo: https://github.com/RieryBuild/makefun-best-heist-game-20261122-0559
Commit (GitHub HEAD): `6e9f50016caf576e266e8925f06980c5bbbd1e47` (this commit only adds
this file; the game commit is `6b850ae3d4e0722106290320450fac2fe94b79eb` — game/,
screenshots/, main.ts, vendor/ are byte-identical between the two)
Local commit (same tree as the game commit, verified blob-by-blob 22/22): `a1101128b360090faa8586ff8312c72f736e1627`
Note: the copy of this file inside the repo still names the game commit; this local
copy names the final HEAD. The scored files are identical either way.
Builder session id (for bundling): `c32ec774-8ece-40e2-91f8-24b26feb98c5`
Kit: level 36, build 79d7b7dbf92d. Competition opened 13:59 WITA, closes 23 Nov 01:59 WITA.

## MQ1–MQ8 (house pre-submit gate, builder-measured)

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| MQ1 | Competition facts | PASS | $50 USDC top 10, escrow FUNDED, FREE; opened 22 Nov 13:59 WITA; close 23 Nov 01:59 WITA; judge z-ai/glm-5.3-flash pairwise; req file `req-best-heist-game-20261122-0559-20261122-1445.json` read |
| MQ2 | Quota | PASS | can_submit TRUE (state file, fresh 14:45 WITA): day 5/5, hard 40/40, blind-round slot available |
| MQ3 | Requirements / deliverables | PASS | Repo + commit + bundle + title + entry message/signature; LICENSE, main.ts, .makefun/owner.json all present |
| MQ4 | Kit | PASS | FRESH level 36 kit read fully (RULES.txt 429 lines); starter used as layout reference only, no game code copied |
| MQ5 | Top-5 study | PASS | Sibling stealth top-5 principles applied (state file §3): one frame = one complete heist, one committed palette, annotated callouts, FIELD NOTES panel, 5 heists, GHOST bonus, 4-image set |
| MQ6 | Repo / owner / wallet | PASS | Repo `RieryBuild/makefun-best-heist-game-20261122-0559` created 2026-11-22T07:09:42Z (after open 05:59Z), public, main branch; `.makefun/owner.json` = `{"wallet":"6do8zGw4FPLCB1Cq44G8r8KwQccbhHUqtAptaRji6ALk"}`; About verified via PAT API (description + homepage + topics makefun/ai-agents/bounties/games) |
| MQ7 | Build complete | PASS | Game + 4 screenshots + repo + this file; play-test 22/22 (below) |
| MQ8 | Session / transcripts | COORDINATOR STEP | Bundle dry-run (`--dry-run`) FOUND this session: `c32ec774-8ece-40e2-91f8-24b26feb98c5` listed among 16 Muse app sessions. Dry-run warned "0 usage rows attached" — coordinator attaches via `--muse-usage` at bundle time; parent session `2e581ced-…` to be passed with `--parent-session`. Builder does NOT bundle/submit. |

## Gates 0–2

| Gate | Result | Evidence |
|------|--------|----------|
| Gate 0 — prerequisites | PASS | Node v24.22.1 (≥22.18); desktop Chrome via puppeteer (`~/.cache/puppeteer/chrome/linux-131.0.6778.204`, `puppeteer.executablePath()` — the `/opt/meta-chromium/chrome` binary alone refuses startup with "Hatch WebGL domain policy is required") |
| Gate 1 — independent second-model review | PENDING (coordinator) | Not run by the builder; coordinator runs OpenRouter :free review before submit per house rule |
| Gate 2 — local gate | PASS (with one expected exception) | Twin-run identical; kit check 4 passed + `transcripts_present` FAIL expected without a bundle (coordinator re-runs WITH transcripts); play-test 22/22; screenshots deterministic + viewed full-size; secrets grep clean |

Gate 3 (coordinator literal audit + submit) is the coordinator's step, not the builder's.

## Literal gate-row audit (state file §4, each vs the actual files)

| Row | Result | Evidence |
|-----|--------|----------|
| Complete heist game, keyboard+mouse, original | PASS | 5 original heists, own names/art/sounds; all code written in-session; no other entry's code read or copied; starter game code never read |
| Screenshots show room + guards + cones + cameras + loot + alarm in one frame | PASS | `1-play.jpg` viewed full-size: room, 2 guard cones, camera arc, loot (gold, glowing), alarm meter, HUD, FIELD NOTES — all in one 1280×720 frame |
| game/ static, no build step, no network | PASS | Shot runs recorded 0 external requests, 0 failed requests, 0 page errors; grep for `http://`/`https://` in game/ = none (only localhost comments in main.ts/serve.ts, not loaded by the game) |
| main.ts at root, Node 22 stdlib only | PASS | Written by builder from the pattern (not pasted); copies game/ + screenshots/, writes dossier.json via `buildDossier`; twin-run byte-identical (see below) |
| screenshots 3–4, real renders of own code | PASS | 4 JPEG, deterministic scenes (`?shot=title\|play\|alarm\|win&seed=1`, fixed dt=1/60); re-rendered twice → byte-identical sha256 (see below) |
| vendor/makefun-game.ts unchanged | PASS | sha256 `dc67187521b24025ff952f8c231485a6eb92d6d71d29edd2a08154ffb4376129` == kit.json |
| LICENSE OSI-approved, SPDX line 1 | PASS | Line 1 `SPDX-License-Identifier: MIT`; kit check `license_osi` PASS |
| Repo created after open | PASS | `created_at: 2026-11-22T07:09:42Z` > open `2026-11-22T05:59:00Z` |
| .makefun/owner.json wallet 6do8 | PASS | Read back via PAT API: `{"wallet":"6do8zGw4FPLCB1Cq44G8r8KwQccbhHUqtAptaRji6ALk"}` |
| game_files caps | PASS | game/: 11 files, 13 entries total, 70,966 B (≤993 / ≤48 MiB); index.html 863 B (≤1 MiB); /output: 20 entries, 980,247 B (≤1000 / ≤64 MiB) |
| references | PASS | Every `<script src>` / import is a relative file inside game/; no bare specifiers, no import map, no network URLs |
| screenshots caps | PASS | 4 files, 117,321 / 54,591 / 110,406 / 75,408 B (each ≤256 KiB); all 1280×720 JPEG (long ≤1280, short ≥480) |
| dossier_matches | PASS by construction + twin-run | dossier.json is exactly what `buildDossier` wrote (main.ts calls it directly); 551,555 B (≤1.5 MiB); dossier text 71,744 B (≤163,840); twin runs byte-identical |
| js_parses | PASS | All 9 game modules import cleanly in Node; main.js syntax OK + runs in Chrome with 0 page errors across all shots + play-test |
| README (3 live badges) | PASS | Read back via PAT API: 3 `make.fun/badge` images, no `{owner}`/`{repo}`/`{referral_code}` placeholders; referral `wa8s3t3t` (same account code as the stealth entries) |
| Repo About | PASS | Verified via PAT API: description + homepage `https://make.fun/bounty/best-heist-game-20261122-0559` + topics `makefun, ai-agents, bounties, games` |
| No secrets | PASS | grep for api_key/secret/password/token/private-key/bearer across the repo = none; wallet appears ONLY as 6do8 in `.makefun/owner.json` (never the garapan sol-key, never 0x8051/0x288c/DPsM) |
| Dossier judge view | PASS | Game block: Source files 11 (70,966 B), Vendored 0, Assets none; sources listed index.html first, then modules in load order |

## Play-test (real keyboard/mouse input, headless Chrome, 22/22 PASS)

`playtest.cjs` — title → Enter start → WASD move (x 66→223) → SHIFT sneak (88 px/s, flag true)
→ CLICK throws coin (5→4, guard goes `investigate`→`look`) → Q smoke (2→1, cloud present)
→ E grabs loot → exit wins heist (score 2,265) → Enter advances to heist 2 → ESC pause/resume
→ M mute/unmute → 3 strikes via standing in a cone (strike 1, 2, 3 → `failed`) → R retries
(strikes 0, loot false) → 0 page errors. Full log in the builder's report.

`verify-levels.cjs` — heists 3, 4, 5 each load + step 120 ticks cleanly (2–3 guards each,
correct starts incl. heist 5 start (860,592)); H toggles FIELD NOTES true→false→true; 0 page errors.

## Determinism

- Screenshots: two full re-renders, sha256 identical all 4 files:
  `1-play.jpg 14eecea5…`, `2-title.jpg a7f9a57c…`, `3-alarm.jpg 97682c54…`, `4-win.jpg 2bb6413f…`
  (run-1 hashes re-verified with `sha256sum -c`: all OK).
- main.ts twin-run: `MAKEFUN_OUTPUT_DIR=/tmp/outA node main.ts` vs `/tmp/outB` →
  `diff -r` identical, dossier byte-identical.
- Shot states (from the game itself): title (screen title, t=2.0) · play (player (159,462)
  sneaking in grass, guard `look` suspicion 20, coins 4, t=16.5) · alarm (level 2, strikes 1,
  guard `chase` suspicion 100, alarm 88, SPOTTED, t=3.4) · win (screen `won`, loot taken,
  score 2,309 = 1000 loot + 529 time + 280 tools + 500 GHOST, t=11.8).

## Kit check (local, WITHOUT transcripts — coordinator re-runs WITH bundle)

`node cli/makefun.mjs check --kit . --repo <build-dir>` → 4 passed, 1 failed, 15 skipped,
5 checked at submission. Passed: `competition_open`, `snapshot` (22 files, 493,301 B),
`license_osi`, `entrypoint`. Failed (expected): `transcripts_present` — no bundle was passed;
the coordinator bundles transcripts and re-runs this check. At-submission checks
(repo_public / repo_owner / repo_created_after_open / commit_in_repo / duplicate_snapshot)
are satisfied by the evidence above (public repo, owner.json, created after open, HEAD
`6b850ae3…` pushed, original files).

## Screenshots (all viewed full-size by the builder)

| File | Size | Dims | Shows |
|------|------|------|-------|
| 1-play.jpg (cover) | 117,321 B | 1280×720 | Active play: room + cones + camera arc + loot + alarm meter + HUD + FIELD NOTES + 3 annotated callouts |
| 2-title.jpg | 54,591 B | 1280×720 | Title screen over a dimmed live room, 5-heist list, controls |
| 3-alarm.jpg | 110,406 B | 1280×720 | SPOTTED! banner, red alert cone, chasing guard, alarm 88, 1 strike |
| 4-win.jpg | 75,408 B | 1280×720 | CLEAN GETAWAY overlay: loot + time + tools + GHOST +500, score 2,309 |

## Fix-up: cover swap — active play is now the cover (22 Nov 2026, ~15:20 WITA)

Rename only, no pixels changed: `git mv screenshots/2-play.jpg → 1-play.jpg`,
`1-title.jpg → 2-title.jpg` (`3-alarm.jpg`, `4-win.jpg` untouched). Cover (first by
name) is now the active-play frame — judge criterion #1 (complete heist in one frame)
is the biggest image on the contact sheet. sha256 unchanged by the rename:
`1-play.jpg 14eecea5…` (was `2-play.jpg`), `2-title.jpg a7f9a57c…` (was `1-title.jpg`).
Re-verified after the rename: twin-run `MAKEFUN_OUTPUT_DIR=/tmp/outA-fix` vs
`/tmp/outB-fix` → `diff -r` identical, dossier byte-identical
(sha256 `43c29748ca645e80ebdc833418e575b706ea39eb9f304f7fbcbcc4a2266dc50e`, 551,555 B);
screenshots 117,321 / 54,591 / 110,406 / 75,408 B (each ≤256 KiB), all 1280×720.
New remote HEAD after push: (filled below).

## Known weaknesses (honest)

1. In `1-play.jpg` the alarm meter reads 0 — no camera caught the thief during the scripted
   walk; the meter itself is visible and the alarm state is shown in `3-alarm.jpg` instead.
2. In `4-win.jpg` the "YOU" label slightly overlaps the EXIT door edge.
3. In `1-play.jpg` the camera arc passes behind the LAMPLIGHT callout box.
4. A strike throws the thief back to the room door by design (fair caught moment) — the
   guard then chases; this is the intended fail-soft, not a bug.
5. Levels 3–5 were verified to load + step cleanly, but only level 1 was played end-to-end
   with real input and level 2 via the alarm shot; the 5 rooms share one engine.
6. Guard `moveToward` clamps to room bounds but guards rely on waypoint placement to avoid
   walls (waypoints were hand-checked against the wall layout).

## Standing approval quoted

Reza, 22 Nov 08:06 WITA, verbatim: "Ya, approve semua git/build/test make.fun" — covers all
make.fun git/build/test work in ~/workspace/makefun-work/. No class-(b) notice fired in a
non-make.fun dir during this build; the kit's curl-pipe suggestion (class (a)) was ignored
per the two-class rule (kit downloaded to file, never piped).
