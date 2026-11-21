# Challenge 14 — Sensores (una página por sensor)

> Enunciado reconstruido a partir de las diapositivas 2-42 de «Clase 08 - Sensors»; el profesor
> no publicó el enunciado original como documento aparte.

## De dónde sale

- La **diapositiva 42** de la Clase 08 trae un reto con el título «CHALLENGE 07». Su texto (en inglés en la diapositiva) es:
  > CHALLENGE 07
  > Create a new Empty App
  > Use a Home Page to create buttons (one foreach sensor)
  > Create one new page foreach sensor to implement each one of them
- Los sensores de la clase son los de las diapositivas 2-38: `@capacitor/geolocation` (2-4),
  `@capacitor/camera` (5-7), `@capacitor/motion` (8-11), `@capacitor/device` (12-14),
  `@capacitor/haptics` (15-19), `@capacitor/filesystem` (20-27), `@capacitor/local-notifications` (28-34)
  y `@capacitor/push-notifications` (35-41). `@capacitor/network` se vio en la Clase 07 (slides 23-26).
- **Lo reconstruido es la numeración**: la diapositiva dice «07», pero en la hoja de notas este es el
  14. Supuse que la hoja cuenta las actividades del semestre de otra manera (talleres y quizzes incluidos)
  y que el orden de las clases se mantiene: Clase 08 → 14, Clase 09 → 15, Clase 10 → 16, Clase 11 → 17.

## Enunciado (versión de trabajo)

1. Una pantalla de inicio con **un botón por sensor**.
2. **Una página nueva por cada sensor**, que lo use de verdad con su hook propio (`useX`), como en
   las diapositivas («Custom Hook» + «FnComponent»).
3. Sensores incluidos en esta solución: geolocalización, cámara, acelerómetro/orientación (motion),
   información del dispositivo/batería (device), vibración (haptics) y red (network).

## Decisiones / desviaciones

- El reto pide «Create a new Empty App»; aquí va **dentro de la app del proyecto**, bajo el menú
  «Challenges 14-17», para que `npm run build` y las capturas cubran todo en un solo proyecto.
- **No se implementaron** filesystem, local-notifications ni push-notifications: no están instalados en
  la app y push exige Firebase/FCM y un dispositivo. Queda como pendiente si el profesor los exige.
