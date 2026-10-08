# Ranchliv 3D – noter til Claude

Brugeren skriver dansk og vil have korte, præcise svar på dansk. Al tekst i spillet er på dansk.

## Arkitektur

- Statisk site uden build-trin. Udgives via GitHub Pages fra `main` (root).
- Hele spillet ligger i én fil: `index.html` (HTML, CSS og JavaScript i ét `<script>`).
- three.js r128 ligger i `vendor/three.min.js` (globalt `THREE`). Opgrader ikke uden at teste, da r128-API'et bruges direkte.

## Koordinater

- Spillogikken arbejder i 2D: `x` = øst/vest, `y` = nord/syd. I 3D bliver logikkens `y` til three.js' `z`; højde er three.js' `y`.
- Verden går fra `WX0,WY0` til `W,H`. Bygninger, folde osv. er rektangler (`R(x,y,w,h)`); kollision sker mod `SOLIDS`.
- Husets placering/indretning afhænger af boform: `HL0` (ranch) og `HLV` (villa). `HOMEM` bestemmes ved indlæsning ud fra det gemte spil.

## Hvor ting ligger

- 3D-modeller: `makeHorse` (racer i `HSH`), `makeDog` (`DSH`), `makeCat` (`CSH`), `makeRabbit` (`RSH`), `makePerson`.
- Verden bygges i `buildWorld()`; himmel `makeSky()`, græs `buildGrass()/updateGrass()`. Jorden tegnes på et canvas i `drawGround()`.
- Hotspots/handlinger: `hotspots()`. Tid og behov: `advance()`. Undervisning: `allSchedule`, `genLesson`, `studentsAfter/promote`.
- Gemte spil: `localStorage`-nøglen `ranchliv_save` (felt `v:2`). Migreringer i `ensureFields()`.

## Test

Tjek syntaks ved at udtrække `<script>`-indholdet og køre `node --check`. Åbn `index.html` i headless Chromium med `--use-gl=swiftshader` og prøv: Nyt spil → ranch/villa → familie → dyr → start.
