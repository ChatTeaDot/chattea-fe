# ChatTea Design System

This document is the single source of truth for ChatTea's product UI. Components consume tokens from `src/theme/tokens.ts`; screens must not reproduce this palette or spacing with literals.

## Foundations

- **Color:** primary `#5c46ff`, decorative magenta `#f323ff`, ink `#292930`, body `#000008`, muted `#75757a`, canvas `#ffffff`, surface `#f5f5f6`, surfaceAlt `#f8f8fa`, hairline `#e0e0e1`, onPrimary `#ffffff`.
- Violet identifies the brand and the single primary action. Magenta is decoration only. Prefer flat canvas/surface contrast over borders and shadows; a soft violet glow is reserved for one hero CTA.
- **Spacing:** 4, 8, 10, 16, 24, 34, 48, 64. **Radius:** utility 8, card 24, brand CTA 28–34, pill 9999.
- Use the system sans font. Titles are 700–800; body is 400–500. Never disable font scaling or truncate essential content.

## Components and states

- Buttons are at least 44pt, expose disabled and busy meaning, and use native press/ripple feedback. Primary buttons are violet; secondary actions remain neutral.
- Inputs use visible labels, 16pt text, native keyboard semantics, a surface fill, and clear focus/error copy.
- Cards use the 24pt radius and cool-grey surfaces without decorative shadows. Badges and segmented tabs use the pill radius.
- Every data surface provides loading, empty, error, success/content, disabled, pressed, and focus behavior as applicable. Never invent data to fill an empty state.

## Platform behavior

- Navigation belongs to expo-router `Stack`/native-stack: system back and transitions, iOS swipe-back and appropriate large titles, and native modal/sheet presentation take priority over custom headers.
- iOS respects safe areas, keyboard insets and sheet conventions. Android uses edge-to-edge system bars, system back, Material elevation through surface hierarchy, and ripple feedback.
- Honor light/dark appearance, Dynamic Type, VoiceOver/TalkBack labels, reduced motion, and a minimum 44pt touch target.

## Korean UX writing

Say only what is needed now, in familiar spoken language. Make the next screen or result predictable, remove repetition and jargon, keep one message per sentence, preserve choice, use inclusive language, and acknowledge the user's likely emotion. Error copy explains a recovery path without blame or fear.
