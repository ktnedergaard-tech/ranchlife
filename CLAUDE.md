# Ranchlivet 3D – noter til Claude

Brugeren skriver dansk og vil have korte, præcise svar på dansk. Al tekst i spillet er på dansk.

## Arkitektur

- Statisk site uden build-trin. Udgives via GitHub Pages fra `main` (root).
- Klassiske `<script>`-filer (ikke ES-moduler), som deler globalt scope. Top-level `const`/`let` i én fil er synlige i de næste. Rækkefølgen i `index.html` er vigtig: core → data → world → state → actions → simulation → render3d → ui → main.
- three.js r128 ligger i `vendor/three.min.js` (globalt `THREE`). Opgrader ikke uden at teste, da r128-API'et bruges direkte.

## Koordinater

- Spillogikken arbejder i 2D: `x` = øst/vest, `y` = nord/syd, i "enheder" (27 enheder ≈ 1 meter, `M` i `render3d.js`).
- I 3D bliver logikkens `y` til three.js' `z`. Højde er three.js' `y`.
- Kortet er `W`×`H` = 3600×2800. Bygninger, folde osv. er rektangler i `world.js`. Kollision sker mod `SOLIDS`, træer og spring.

## Hvor ting ligger

- Handlinger nær spilleren (knapperne nederst): `actions()` i `actions.js`.
- Tidens gang, behov, fodringstjek: `tickMinute()` og `hourly()` i `state.js`.
- Ridning, gangarter og spring: `updRiding()`, `jump()`, `land()` i `simulation.js`.
- 3D-modeller: `buildPerson`, `buildHorse`, `buildDog`, `buildCat`, `buildRabbit` i `render3d.js`. Verden bygges én gang i `buildWorld()`. Gulve og jord tegnes på et 2D-canvas (`paintGround()`) og bruges som tekstur.
- Gemte spil: `localStorage`-nøglen `ranchlivet-save-v1`. Ændres formatet på `G`, skal gamle gemte spil stadig kunne indlæses, eller nøglen skal skifte.

## Test

Der er ingen testsuite. Tjek syntaks med `node --check js/*.js`, og åbn `index.html` i en browser (eller headless Chromium med `--use-gl=swiftshader`) og prøv: ny person → dyr → start, gå ind i huset, sadl en hest og spring på ridebanen.
