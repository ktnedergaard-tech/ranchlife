# Ranchlivet 3D

Et heste- og ranchspil i 3D, der kører direkte i browseren på computer og mobil.

Du laver din egen person, vælger race og navn til dine dyr (2 heste, 1 hund, 1 kat og 2 kaniner) og flytter ind på en ranch med naboer, skov og strand tæt på.

## Det kan man i spillet

- **Passe dyrene:** fodre morgen og aften, strigle, sadle op på opstaldningspladsen, muge ud, feje staldgangen og rense kaninburet.
- **Ride:** holdt, skridt, trav og galop med langsomt, normalt og hurtigt tempo. Spring på ridebanen (40–100 cm), over væltede træer i skoven og ride i vandkanten.
- **Andre dyr:** gå tur med hunden og lave kaninhop med kaninerne.
- **Hverdag:** arbejde kl. 08–14 (man kan pjække), lave mad, gå på toilettet, tage bad og selv vælge sengetid.
- **Weekend:** tage til stævner med bilen og hestetransporteren.
- **Computeren:** købe og sælge dyr (højst 2 kaniner, 3 hunde, 3 katte og 4 heste) og bestille foder.
- **Naboen Birgitte:** besøge hende og drikke kaffe.

Spillet gemmes automatisk i browseren.

## Styring

| Handling | Computer | Mobil |
|---|---|---|
| Gå / styre hesten | WASD eller piletaster | Joystick |
| Løbe | Shift | – |
| Handlinger | E, Enter eller 1–9 | Knapperne nederst |
| Gangart op/ned | R / F | Knapper |
| Tempo ned/op | Z / X | Knapper |
| Spring | Mellemrum | Knap |
| Dreje kameraet | Træk med musen, Q / C | Træk med fingeren |
| Zoome | Scroll | Knib |

## Kør det lokalt

Åbn `index.html` direkte i en browser. Der er ingen build-trin og ingen afhængigheder ud over den medfølgende three.js.

Du kan også starte en lille webserver i mappen, fx:

```
python3 -m http.server 8000
```

og åbne http://localhost:8000.

## Udgiv på GitHub Pages

1. Gå til **Settings → Pages** i repoet.
2. Under **Build and deployment** vælger du **Source: Deploy from a branch**.
3. Vælg branch **main** og mappe **/ (root)**, og tryk **Save**.

Efter et par minutter ligger spillet på https://ktnedergaard-tech.github.io/ranchlife/. Hver gang der pushes til `main`, bliver siden opdateret automatisk.

## Projektstruktur

```
index.html          Sidens markup og indlæsning af scripts
css/style.css       Udseende for menuer, HUD og knapper
js/core.js          Hjælpefunktioner
js/data.js          Racer, farver og valgmuligheder
js/world.js         Kortets layout, forhindringer og træer
js/state.js         Spiltilstand, behov og tid
js/actions.js       Handlinger, butik og stævner
js/simulation.js    Bevægelse, dyr og ridning
js/render3d.js      3D-grafik (three.js)
js/ui.js            HUD, styring og person-editor
js/main.js          Opstart og hovedløkke
vendor/             three.js r128 (MIT-licens)
```

Scriptsene er almindelige `<script>`-filer, der deler globale variabler. De skal derfor indlæses i den rækkefølge, de står i `index.html`.
