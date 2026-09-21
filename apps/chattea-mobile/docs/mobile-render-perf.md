# Mobile render performance — React Compiler

## Why React Compiler instead of manual memoization

Manual `useCallback`/`useMemo`/`memo` coverage rots: every new prop or hook dependency can silently bust a memo boundary, and the code carries the debt forever. React Compiler applies the same memoization automatically at build time, so the source stays free of stability plumbing and new code is covered by default.

Expo 56 ships first-class support via `experiments.reactCompiler` in `app.config.js`, which wires `babel-plugin-react-compiler` into babel-preset-expo for the Metro bundle. Vitest applies the same transform through a Babel plugin in `vitest.config.ts` so the render-count tests measure compiled output, not the raw source.

## What the compiler does and does not cover

Measured on this codebase:

- Stabilizes callbacks and JSX produced inside a component's own render. This is what fixed `sendInterest`/`openRoom`-style prop drift that busted item memo on every poll.
- Does NOT replace list-item boundaries. `renderItem` executes inside `LegendList`'s render, so each call produces fresh elements. `React.memo` on the row/cell component remains the reconciliation boundary and is kept deliberately (`GridCell`, `RoomRow`).
- Bails out per function on unsupported constructs. `try/catch` wrapping awaited value blocks and `throw` inside `try/catch` made `useTodayMatches`, `useLikes`, `useCandidateDetail` skip compilation entirely, so every callback they returned was unstable. The guarded async bodies were extracted to module-level helpers (`performMatchAction`, `performUndo`, `performBoostActivation`, `performSendInterest`, `performSendLike`); the hook-returned functions now compile.

## Manual fixes applied beyond the compiler

- `estimatedItemSize` on the rooms list (`ROOM_ROW_ESTIMATED_HEIGHT = 73`) and likes grid (`LIKE_GRID_CELL_HEIGHT = 184`) — LegendList's `getItemLayout` equivalent. `recycleItems` and `keyExtractor` were already in place via `NativeList`.
- `useLikes` keeps the candidate array in a ref synced by effect, so `sendInterest` depends only on stable values.
- `useDeferredValue` was evaluated and not needed: there is no high-frequency text input driving these lists.

## Measurement conditions

- Harness: Vitest 3 + `react-test-renderer` 19.2.3 (`test/render-count.test.tsx`). Apollo `useQuery`/`useMutation`, LegendList, gesture-handler, reanimated and other native modules are mocked; `useMutation` returns a stable mutate function matching real Apollo behavior.
- Compiler toggle: `VITEST_REACT_COMPILER=0 pnpm vitest run test/render-count.test.tsx` reproduces the baseline; default run is compiler-on.
- Data: 30 chat rooms, 20 liked-me candidates, 1 swipe candidate.
- Counts are component render invocations per scenario, not device frames. No simulator/device frame-drop or response-time delta was captured — the numbers below are test-harness render counts. A production build on-device with React DevTools Profiler is the follow-up for frame-level data.

## Results

| Scenario                          | Baseline (compiler off)      | Compiler on                       | Delta |
| --------------------------------- | ---------------------------- | --------------------------------- | ----- |
| Rooms: poll updates 1 of 30 rows  | 30 row renders               | 1                                 | -97%  |
| Likes: 1 of 20 cells updates      | 20 cell renders              | 1                                 | -95%  |
| Swipe: unrelated parent re-render | 1 card + 1 action bar render | 0                                 | -100% |
| List tuning                       | no `estimatedItemSize`       | `estimatedItemSize` on both lists | n/a   |

Regression coverage: `test/render-count.test.tsx` asserts the compiler-on counts above, so a refactor that reintroduces per-item renders fails CI.
