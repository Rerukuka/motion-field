# Motion Field

Ten original concept websites, each with a separate route and a motion treatment drawn from the subject. All ten run in the browser. The architecture, race, film, restaurant and brands are fictional demo projects.

| Study | Motion and interaction |
| --- | --- |
| [Kiln 1260](https://rerukuka.github.io/motion-field/kiln/) | A slow photo reveal and a comparison of three vessel details |
| [Datum](https://rerukuka.github.io/motion-field/datum/) | A section marker moves through a coastal library |
| [Brasa](https://rerukuka.github.io/motion-field/brasa/) | A print-like curtain wipe between three dishes |
| [The Quiet Relay](https://rerukuka.github.io/motion-field/relay/) | A nine-second title sequence with play, pause and scene selection |
| [Scree](https://rerukuka.github.io/motion-field/scree/) | An elevation cursor follows the selected segment |
| [Formwerk](https://rerukuka.github.io/motion-field/formwerk/) | An editable specimen with variable font weight |
| [Night Dial](https://rerukuka.github.io/motion-field/night-dial/) | A turntable synced to three synthesized programmes |
| [Umbra](https://rerukuka.github.io/motion-field/umbra/) | The Moon moves through Earth’s shadow as the viewer scrubs its path |
| [Intertidal](https://rerukuka.github.io/motion-field/intertidal/) | An interactive cross-section with a movable waterline |
| [Offcut](https://rerukuka.github.io/motion-field/offcut/) | The issue’s three covers move through a stack |

## Tools and models

Each site includes a practical tool under **Tool** and an original model under **3D**. Settings stay in the browser. The calculators can export CSV, and Formwerk copies stylesheet declarations. A model can be rotated and zoomed with its control buttons, the keyboard, or by dragging. Each model also has a preview and a downloadable GLB.

| Study | Tool |
| --- | --- |
| Kiln 1260 | Calculate the dimensions to make before clay shrinkage |
| Datum | Convert lengths on a scaled drawing into dimensions and rectangular area |
| Brasa | Plan an order and split the sample menu estimate per guest |
| The Quiet Relay | Edit the running time of each title scene and export production cues |
| Scree | Estimate moving time from distance, pace and climbing allowance |
| Formwerk | Preview a type setting and copy its CSS |
| Night Dial | Set volume and choose the original BPM or a custom tempo |
| Umbra | Calculate percent coverage in a simplified eclipse cross-section |
| Intertidal | Interpolate a crossing time between supplied low and high tides |
| Offcut | Arrange pages on the front and back of each folded booklet sheet |

## Source and preview

`source/studies.mjs` contains study copy, `source/build.mjs` renders the HTML, and `source/art.js` implements the original canvas illustrations. Calculations are in `source/utilities.js` and model geometry is in `source/model-blueprints.js`. `dist/` contains the deployable site, local media, 3D assets and Three.js r187 under its MIT license. The renderer loads only when a visitor opens a model. The sites require no external APIs.

```sh
node source/build.mjs
python -m http.server 8000 --directory dist
```

The public [Motion Field index](https://rerukuka.github.io/motion-field/) is served by GitHub Pages from the root of the `gh-pages` branch.

## References and credits

- [VideoSmile’s motion roundup](https://videosmile.ru/post/455-moushn-dizayneram-8-saytov-dlya-vdohnoveniya) and [WINE after COFFEE](https://vimeo.com/channels/wineaftercoffee) informed the title sequences and their pacing.
- [STASH](https://www.stashmedia.tv/), [Motionographer](https://motionographer.com/) and [Good Moves](https://goodmoves.tv/tag/animation) informed the tactile image treatment, silhouette and transitions.
- [SearchSystem](https://searchsystem.co/) and [Rebrand Gallery](https://www.rebrand.gallery/) informed the editorial hierarchy and individual brand systems.
- [Move The System on Behance](https://www.behance.net/gallery/100966683/Move-The-System-01-Moving-Posters-Collection) and [Kinetic Typography for Digital Brands](https://www.behance.net/gallery/247012105/Kinetic-Typography-for-Digital-Brands) informed the cover stack and the variable type specimen.
- Design refinement followed [Unslop](https://github.com/heydamir/unslop), created by Damir Sokolovsky. The hero images were generated for this collection. The artwork, diagrams, motion code and synthesizer were made for the studies. Font licenses are included in `dist/assets/licenses/`.
