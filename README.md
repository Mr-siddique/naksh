# naksh

A chat screen for talking to an AI astrologer, built for the MyNaksh machine-coding round. React Native 0.87 (bare, New Architecture), TypeScript, Zustand, Reanimated 4. Everything is mocked, so there's no backend to set up.

## Running it

```sh
npm install
cd ios && bundle exec pod install && cd ..   # first time, and after native dep changes
npm start
npm run ios        # or: npm run android
```

```sh
npm test           # Jest
npm run verify     # lint + typecheck + tests, the bar for every change
```

Needs Node 22.11 or newer.

## Trying the failure cases

In a debug build there's a ⚙︎ button in the header. It opens a sheet with four scenarios: **Normal**, **Empty conversation**, **Load fails** and **Sends fail**. Picking one reloads the conversation under that scenario, so you can see the empty, error and failed-send states (with Retry) without editing any code. The button doesn't exist in release builds.

## How it's laid out

```
src/
  features/conversation/
    components/        bubbles, composer, action sheet, feedback bar, toast...
    recommendations/   the registry and the card components
    store/             one Zustand store
    utils/             pure helpers (timeline, streaming, feedback, ...)
    screens/
  services/chatApi.ts  the mock API (delays, failures, scenarios)
  theme/               colors, spacing, motion
```

Code lives in its feature folder until a second feature needs it. Tests sit next to the code, and each test name starts with the requirement it covers (for example `R6.3: ...`). The specs behind all of this are in `specs/` if you want the reasoning.

## Components

The screen is a list of messages with a composer underneath. `MessageRow` picks the right component for each message type: `UserMessage`, `AiMessage`, `HumanMessage` or `SystemMessage`. They all sit on one shared `Bubble`, so alignment, grouping, accessibility labels and long-press are handled in a single place. Date separators and the timeline grouping come from one pure function, `buildTimeline`.

## State

A single Zustand store holds the messages, load state, reply target, streaming progress, the open action sheet and the toast. I picked Zustand because components can subscribe to just the slice they need, and that matters here: the streaming text updates many times a second and only that one row should re-render. Context would have re-rendered everything below it. Redux Toolkit would have worked, but it's more ceremony than this screen needs.

Async work (loading, sending, streaming) is guarded by a session counter. If you reload or leave the screen while something is in flight, the old result is dropped instead of writing into the new state.

## Recommendations

Each AI message can carry cards (gemstone, tarot, consultation, article, promotion, remedy). A registry maps a type to its icon, label, accent colour and an optional `Component`. Rendering a card is just a lookup, and unknown types fall back to a generic card instead of crashing.

To add something new, like Panchang, add one entry to `RECOMMENDATION_CONFIG` (and the type to `RecommendationType`). If it needs a different look, give it a `Component` and nothing else in the list changes. Tapping any card shows an Alert, since detail screens are out of scope.

## Performance

- The message list is an inverted, virtualized `FlatList`, so new messages land at the bottom and the list keeps the reader's place when rows are added or removed.
- Rows are memoized and receive stable props, so rating one message re-renders only that message.
- Streaming is a `requestAnimationFrame` loop based on elapsed time, not frame count, so the speed doesn't depend on the device. Only the text of the streaming row re-renders, and the loop is cancelled on reload and unmount.
- Animations run on the UI thread through Reanimated and respect the system's Reduce Motion setting. A message only animates in when it's brand new, so rows scrolling back into view stay still.

## Trade-offs

It was a time-boxed build, so some things were left on purpose:

- All data is mocked, nothing persists, and the AI reply is always the same canned text.
- No recommendation detail screens, auth, or push notifications.
- Delete should be a two-step process (with a confirmation).
