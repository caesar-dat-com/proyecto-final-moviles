# Challenge 17 — Buscador de GIFs con la API de GIPHY

> Enunciado reconstruido a partir de las diapositivas 2-34 de «Clase 11 - API requests»; el profesor
> no publicó el enunciado original como documento aparte.

## De dónde sale

- La **diapositiva 34** de la Clase 11 trae un reto con el título «CHALLENGE 09». Su texto (en inglés en la diapositiva) es:
  > Create an account in https://developers.giphy.com/
  > Add one App and read api documentation from GIPHY
  > Create a new project to search and show Gifs, you could search by writing in an input field, then show the Gifs in screen.
  > Set the api key into environment variables (.env)
  > Use search api to get gifs from Giphy
  > Implement Fetch / Axios to call the api.
- La diapositiva incluye un ejemplo con `URLSearchParams` (`api_key`, `q`, `limit: 25`, `offset: 0`,
  `rating: "g"`, `lang`) y `fetch('https://api.giphy.com/v1/gifs/search?...')`. La llave que aparece en
  la diapositiva **no se copió** al código: el reto pide ponerla en `.env`.
- Buenas prácticas de la misma clase que se aplicaron: revisar `res.ok` (diapositiva 14),
  `AbortController` (16), timeouts (17), un cliente reutilizable (18), `Promise.allSettled` (21) y un
  hook tipo `useFetch` que cancela la petición anterior (32-33).
- **Lo reconstruido es la numeración** («09» → «17»).

## Enunciado (versión de trabajo)

1. Crear una cuenta y una app en GIPHY Developers, y poner la llave en `.env`.
2. Hacer una pantalla con un campo de búsqueda y mostrar los GIFs que devuelve `/v1/gifs/search`.
3. Llamar la API con `fetch` (o Axios).
