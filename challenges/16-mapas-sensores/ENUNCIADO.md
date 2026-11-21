# Challenge 16 — Completar la app de mapas con sensores

> Enunciado reconstruido a partir de las diapositivas 2-8 de «Clase 10 - Apis_n_Maps»; el profesor no
> publicó el enunciado original como documento aparte.

## De dónde sale

- La **diapositiva 8** de la Clase 10 trae un reto con el título «CHALLENGE 08». El mismo número está
  repetido en la diapositiva 23 de la Clase 09; parece un error de copia del profesor. Su texto (en inglés en la diapositiva) es:
  > Complete the maps app by using different sensors. Some examples:
  > - Check if you have wifi to get current address, show the map, etc.
  > - You could detect if the phone is moving or not, to start/stop tracking
  > - Save the tracking in a JSON file, then make a history page to show previous tracking in a day
  > - Take a picture and put the current location as a watermark
  > - Vibrate the phone on start tracking
  > - Stop tracking when battery is low.
  > - Create smart notifications (long time without moving, no connection, quick moving
  > - Show nearest places with OpenCage API
- Base técnica: diapositivas 2-3 (`useGeolocation` con `watchPosition`), 4, 6 y 7 (leaflet + react-leaflet)
  y 5 (servicios con `fetch`).
- **Lo reconstruido**: la numeración («08» → «16») y qué ejemplos cuentan. La diapositiva dice «Some
  examples», así que el profesor no exige una lista cerrada. Se implementaron 7 de los 8.

## Enunciado (versión de trabajo)

Una app de mapas con seguimiento que:
1. Muestra el mapa con la ruta y la posición actual.
2. Si hay conexión, muestra la dirección actual. Si no, solo las coordenadas.
3. Detecta si el teléfono está quieto, caminando o en movimiento rápido.
4. Guarda cada recorrido en JSON y tiene una página de historial por día, con exportar e importar.
5. Toma una foto y le pone la ubicación actual como marca de agua.
6. Vibra al iniciar el seguimiento.
7. Detiene el seguimiento si la batería está baja.
8. Muestra avisos «inteligentes»: mucho tiempo quieto, sin conexión o movimiento rápido.

**No implementado**: «nearest places with OpenCage API». Exige crear una cuenta y una llave de OpenCage,
y no envié datos a servicios nuevos.
