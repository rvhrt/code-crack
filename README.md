# Code Crack practice

Independent mobile-friendly trainer inspired by the supplied Turo Cheat Codes promotional screenshot. No graphics or assets copied from the campaign. No accounts, server, analytics or dependencies. Personal bests stay in your browser.

## Run

Open a terminal in this folder and run `python3 -m http.server 8000` (or `npm start`), then visit http://localhost:8000. ES modules require an HTTP server rather than opening index.html as a file. Run the game logic tests with `npm test` (Node 20+).

## GitHub Pages

Push this folder's contents to your repository. In GitHub, select Settings → Pages → Deploy from a branch → main → / (root), then Save. All asset links are relative, so project Pages URLs work without configuration. No build step or GitHub Actions workflow required.

## Practice

Tap Start and reproduce the visible target code from left to right. The layout retains shoulder order L1, L2, R2, R1; left D-pad (up/left/right/down); right face diamond (triangle/square/circle/cross). Six symbols is the default. Settings offer 4–12 symbols, 1–20 codes and two mistake behaviors. These are training variants, not confirmed official stages. The timer starts on Start, includes mistakes and all codes, and stops on the final correct input. Leaving the tab invalidates the attempt. Retry reuses all codes; Go again generates new ones. Repeats are allowed; all twelve inputs have equal probability, using crypto.getRandomValues with rejection sampling. The official distribution is unknown.

Keyboard: arrows; Q/W/O/P for L1/L2/R2/R1; I/J/L/K for triangle/square/circle/cross. Tab and Enter/Space also operate buttons. The controls respond on pointer-down for low-latency touch input, without counting the later click twice.

See RESEARCH.md for evidence, sources and uncertainty. The screenshot is an indicative promotional mockup, not a verified specification.

## Game tabs

- **Code Crack:** original full-controller input game. All twelve inputs remain in the random pool. The progressive course has been removed. Symbol count, repeated codes and mistake behavior remain configurable.
- **Cookie Combo:** practice recreation of the 2023 Oreo × Xbox four-symbol deduction game, with six possible symbols and repeats. Feedback marks exact positions, misplaced symbols and unmatched symbols. Each secret occurrence is counted once; original duplicate handling is not confirmed. Start the timer by selecting a symbol. Undo edits the current guess, Check submits it, and New hidden code resets the game.
- **Kryptos Maze:** practice recreation of the timed tilt-maze mechanic from Rolls-Royce’s 2020 mobile campaign. A fresh 9×9 perfect maze has a 90-second deadline. These dimensions, timing and generated layouts are trainer choices. Use touch arrows, keyboard arrows or optional device tilt. Start maze retries the same maze; New maze generates another. Phone motion sensors may require HTTPS and permission; touch controls always work. Hold the phone roughly flat for tilt input.

Switching games or leaving the browser tab ends an active attempt. There are no prize entries, cookie camera scanning, external services or accounts. Game mechanics are recreated from public descriptions; original artwork and exact layouts are not copied. The other Kryptos stages are not implemented because their full content is not verified.
