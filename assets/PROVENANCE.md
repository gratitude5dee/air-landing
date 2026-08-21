# Air launch asset provenance

Runtime release: `v2026-08-19-a`
Generated/processed: 2026-08-19–20
The runtime derivatives intentionally remove nonessential source metadata and use content-versioned URLs.

## User-supplied sources

| Asset | Source | Derivation | SHA-256 |
| --- | --- | --- | --- |
| Opening sky | `/Users/gratitud3/.codex/generated_images/01a003b0-2f34-7a01-8f46-4d7a6f8a2aba/finframe.png` | Exact source preserved at `assets/source/opening/finframe.png`; resized/re-encoded to the runtime WebP. | `aae3baa455e94e6db0e357c5a32657f900b2bfe415fbaa095cf998b92e13f2bb` |
| Air master film | `/Users/gratitud3/Downloads/airfinal(fin) (1).mov` | Golden Gate stills at 20.0s and 23.5s; silent 8.0s first-cut excerpt from 17.0–25.0s. Runtime video is 1280×720, 30fps, ≤0.5s keyframe cadence. | Source remains outside this repository. |
| iMessage reference | `/Users/gratitud3/Downloads/chat_imessage_air-by-wzrd-tech.png` | Existing runtime supporting image at `public/images/air-imessage-reference.png`. | Preserved separately from this release manifest. |
| TextLab fragments | `/Users/gratitud3/Downloads/textlab_hey-air-lets-run-a-wzrd-workflow/` | Existing transparent workflow fragments under `public/images/textlab/`. | Preserved separately from this release manifest. |

## OpenAI-generated storyboard sources

All images below were generated with OpenAI image generation. The shared direction was: cinematic editorial frame, 16:9, Air's pearl-cloud / pale-sky / cobalt-chrome palette, no text, no logos, no third-party brand marks, and enough negative space for UI composition.

| Direction / shot | Generation ID | Prompt role | Source SHA-256 |
| --- | --- | --- | --- |
| Chrome launch / icon | `exec-5ab8246e-7cf6-4bb6-8a64-8c0704eacf10` | Polished chrome hero object floating weightlessly in an open pearl-blue sky. | `ae81d4f553f5a2b7b5a059f6e89976af9c2363d67d1e45da34de629fe3e7ebc5` |
| Chrome launch / macro | `exec-40902446-54af-48b9-b725-3e8bd7c1f1b6` | Macro chrome surface reflecting Air-blue light and soft clouds. | `238ac59040bd6cca68d6e67746c10a44821c4bbb37aa3f347c71755c674bf288` |
| Chrome launch / orbit | `exec-89898956-1f15-4e52-9a94-afb991a168ac` | Chrome object with restrained abstract app-light signals in orbit. | `633cded8065d88852585db1f0fbfc4bd03ed2d6d5c053d474f7b713568afaee1` |
| Blue hour / portrait | `exec-986fc914-6fac-4327-adee-d6a08212c50b` | Intimate creator portrait lit by a phone at blue hour, documentary rather than glossy. | `2f2db17830ee6aab1eaf9a8fe219ebaf434001501c91c23274d8af2d937cf4f3` |
| Blue hour / hands | `exec-b9ca27bf-6aca-4db3-9d8d-a0972b9b6e41` | Tactile hands recording a voice note in dusk light. | `2acfbe7f6acc950eba2d3a21ac358071338a5d3ab732653344c35773682bfe61` |
| Blue hour / city | `exec-305d22d9-dd6b-45f0-bef3-4ba198e9700f` | Creator moving into a cobalt city street after rain. | `7f8b2de9f83b102b77f38a1e59b636a5683d67ced844ab33d1b48504aab94ebb` |
| Golden Gate / bridge cleanup | `exec-734451f4-d1b1-4dc3-80bc-76b6d007de8a` | Precise edit of a supplied film still: remove the reclining person while preserving the bridge, sky, grass, framing, and color. | `1fe44b21c63a57a2349d73a34473eddb61cc413956bfecb3e552090d8d55f2dc` |
| Closing / blue-hour horizon | `exec-bdf3764a-4ad9-4c42-b002-c2353d1ff7c0` | Original landscape-only horizon for the preorder finale: pearl-to-cobalt sky, low cloud banks, no people, text, logos, brands, or devices. Runtime derivative: `/images/closing/v2026-08-21-a/blue-hour-horizon.avif`. | `05eca63b2db4efca950186c1d68c1607dcdf68bb80e43341669c4973a18cde8f` |

## Golden Gate source frames

| File | Derivation | SHA-256 |
| --- | --- | --- |
| `assets/source/storyboards/golden-gate/01-dog.jpg` | Master film at 23.5s. | `9c648bf3b9791337ede64fc4d9429cc2c624264c12b72de6832697e1fa1bf793` |
| `assets/source/storyboards/golden-gate/02-creator.jpg` | Master film at 20.0s. | `e2320cb1c8b8325d46235f2e0d7f030bca78bbaffcad3f11bca19eec06b623fc` |
| `assets/source/storyboards/golden-gate/03-bridge.png` | OpenAI cleanup described above. | `1fe44b21c63a57a2349d73a34473eddb61cc413956bfecb3e552090d8d55f2dc` |

`npm run verify:assets` verifies runtime path containment, image dimensions/size budgets, video codec/container/duration/audio contract, and keyframe cadence before every production build.
