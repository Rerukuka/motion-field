# Motion Field QA

The first version and each of the five revisions were opened in desktop Chrome at 1440 × 920 and in narrow viewports at 390 × 844 and 320 × 844. The 320 px run used the browser's reduced-motion preference. At every round, the checks covered page and asset responses, layout overflow, image and font load, keyboard access to the skip link, and each study's selection behavior. The desktop run also exercised the type input, keyboard interaction with diagram sliders, the canvas output, and film/audio start and pause.

| Round | Changes after review |
| --- | --- |
| 1. Composition | Tuned the type and layout balance of each hero, corrected photo framing, and resolved tight headline columns on Datum, Intertidal, Umbra and Offcut. |
| 2. Interaction | Gave each main action an appropriate target. Synced diagram and type presets with their controls, connected the film index to the player, handled rapid audio startup clicks, and made Kiln's detail view follow the vessel selection. |
| 3. Art and content | Refined the reading area and changed the visual treatment to match each project. Drew individual print motifs for Offcut and replaced generic index symbols with previews based on the subjects. |
| 4. Keyboard and touch | Added a focused main region, 44 px navigation targets, clear selection states, proportional type sizing for long input, and per-project contrast or reduced-motion fixes. |
| 5. Media and motion | Added responsive image sources, avoided duplicate canvas paints, reduced title sequence DOM updates, suspended offscreen record movement, and tuned menu and cover transitions. |

All ten studies passed the checks in each recorded round. These are desktop browser checks with simulated viewport widths, not physical iOS or Android device tests.

## Tools and 3D update

- Calculator unit checks cover all ten tools, including booklet padding and reading direction, a tide interval crossing midnight, title cue precision and input limits. Run them with `node --test tests/utilities.test.mjs`.
- Browser passes at 1440, 390 and 320 px exercise edited inputs, calculation results, local storage, CSV export, original and custom playback tempos, and title timings in the film player.
- Each model is checked for a valid downloadable GLB, a decodable preview, visible WebGL output and a measurable camera change. The narrow-browser pass checks zoom, recovery after simulated WebGL context loss and return to the preview.
- Visual review corrected the model previews’ framing and centered the orbit camera. The accessibility pass checked navigation to the tools, keyboard orbit controls and the 320 px reduced-motion setting.
