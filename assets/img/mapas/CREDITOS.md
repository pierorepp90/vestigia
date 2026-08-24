# Créditos de los mapas de ruta

Los 7 mapas de `assets/img/mapas/*.svg` se generan con
`scripts/generar-mapas.mjs` a partir de datos de calles y edificios de
OpenStreetMap, obtenidos vía la Overpass API. El estilo (silueta rasgada,
grano, viñeta, óvalo de zona) se dibuja por completo en el script; no es una
imagen de terceros, solo la geometría de calles lo es.

© OpenStreetMap contributors — datos disponibles bajo la
[Open Database License](https://www.openstreetmap.org/copyright).

Si cambia la zona de una ruta, ajusta su entrada en `ZONAS` dentro del
script y vuelve a ejecutarlo solo para esa ruta:
`node scripts/generar-mapas.mjs <rutaId>`.
