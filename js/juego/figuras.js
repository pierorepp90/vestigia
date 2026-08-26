// js/juego/figuras.js
//
// Figuras SVG de los enigmas visuales (identificar formas, completar
// patrones, señalar zonas). Viven aquí y no en los JSON de contenido por
// dos razones: son idénticas en los cuatro idiomas —se etiquetan con
// letras y números, nunca con palabras—, y así viajan en el bundle de la
// app en vez de multiplicarse por cuatro dentro del contenido.
//
// Reglas de dibujo, para que una figura nueva encaje con las demás:
//   1. `currentColor` en todos los trazos principales: la misma figura se
//      dibuja sobre el fondo oscuro del juego y sobre el papel del PDF.
//   2. Lo que marca la pregunta (el hueco a rellenar, las zonas numeradas)
//      usa la clase `figura__acento`; el CSS le da el color de cada tema.
//   3. Nada de distinguir opciones por color: solo forma, para que el PDF
//      impreso en blanco y negro siga siendo jugable.
//   4. Las opciones se rotulan A, B, C… y las zonas 1, 2, 3… — la respuesta
//      que teclea el jugador es esa letra o ese número.

const FIGURAS = {
  // Aparejo de la cúpula de Brunelleschi: hiladas horizontales trabadas cada
  // cierto tramo por un ladrillo vertical. Los verticales bajan en diagonal
  // (x=100, 160, y el hueco en 220) para que la lógica sea inequívoca.
  'aparejo-cupula': `
<svg viewBox="0 0 620 360" xmlns="http://www.w3.org/2000/svg" role="img" fill="none" stroke="currentColor" stroke-width="2">
  <g>
    <rect x="40" y="30" width="56" height="26"/><rect x="40" y="62" width="56" height="26"/>
    <rect x="100" y="30" width="26" height="58"/>
    <rect x="130" y="30" width="56" height="26"/><rect x="130" y="62" width="56" height="26"/>
    <rect x="190" y="30" width="56" height="26"/><rect x="190" y="62" width="56" height="26"/>
    <rect x="250" y="30" width="56" height="26"/><rect x="250" y="62" width="56" height="26"/>
    <rect x="310" y="30" width="56" height="26"/><rect x="310" y="62" width="56" height="26"/>
    <rect x="370" y="30" width="56" height="26"/><rect x="370" y="62" width="56" height="26"/>
    <rect x="430" y="30" width="56" height="26"/><rect x="430" y="62" width="56" height="26"/>
    <rect x="490" y="30" width="56" height="26"/><rect x="490" y="62" width="56" height="26"/>
  </g>
  <g>
    <rect x="40" y="96" width="56" height="26"/><rect x="40" y="128" width="56" height="26"/>
    <rect x="100" y="96" width="56" height="26"/><rect x="100" y="128" width="56" height="26"/>
    <rect x="160" y="96" width="26" height="58"/>
    <rect x="190" y="96" width="56" height="26"/><rect x="190" y="128" width="56" height="26"/>
    <rect x="250" y="96" width="56" height="26"/><rect x="250" y="128" width="56" height="26"/>
    <rect x="310" y="96" width="56" height="26"/><rect x="310" y="128" width="56" height="26"/>
    <rect x="370" y="96" width="56" height="26"/><rect x="370" y="128" width="56" height="26"/>
    <rect x="430" y="96" width="56" height="26"/><rect x="430" y="128" width="56" height="26"/>
    <rect x="490" y="96" width="56" height="26"/><rect x="490" y="128" width="56" height="26"/>
  </g>
  <g>
    <rect x="40" y="162" width="56" height="26"/><rect x="40" y="194" width="56" height="26"/>
    <rect x="100" y="162" width="56" height="26"/><rect x="100" y="194" width="56" height="26"/>
    <rect x="160" y="162" width="56" height="26"/><rect x="160" y="194" width="56" height="26"/>
    <rect x="250" y="162" width="56" height="26"/><rect x="250" y="194" width="56" height="26"/>
    <rect x="310" y="162" width="56" height="26"/><rect x="310" y="194" width="56" height="26"/>
    <rect x="370" y="162" width="56" height="26"/><rect x="370" y="194" width="56" height="26"/>
    <rect x="430" y="162" width="56" height="26"/><rect x="430" y="194" width="56" height="26"/>
    <rect x="490" y="162" width="56" height="26"/><rect x="490" y="194" width="56" height="26"/>
  </g>
  <rect class="figura__acento" x="218" y="160" width="30" height="62" stroke-dasharray="5 4" stroke-width="2.5"/>
  <text class="figura__acento" x="233" y="201" font-size="26" stroke="none" fill="currentColor" text-anchor="middle">?</text>

  <g transform="translate(45,248)">
    <rect x="0" y="0" width="110" height="76" stroke-width="1.5" opacity="0.5"/>
    <rect x="42" y="9" width="26" height="58"/>
    <text x="55" y="97" font-size="18" stroke="none" fill="currentColor" text-anchor="middle">A</text>
  </g>
  <g transform="translate(185,248)">
    <rect x="0" y="0" width="110" height="76" stroke-width="1.5" opacity="0.5"/>
    <rect x="27" y="25" width="56" height="26"/>
    <text x="55" y="97" font-size="18" stroke="none" fill="currentColor" text-anchor="middle">B</text>
  </g>
  <g transform="translate(325,248)">
    <rect x="0" y="0" width="110" height="76" stroke-width="1.5" opacity="0.5"/>
    <rect x="20" y="26" width="56" height="26" transform="rotate(-30 20 26)"/>
    <text x="55" y="97" font-size="18" stroke="none" fill="currentColor" text-anchor="middle">C</text>
  </g>
  <g transform="translate(465,248)">
    <rect x="0" y="0" width="110" height="76" stroke-width="1.5" opacity="0.5"/>
    <rect x="42" y="9" width="26" height="26"/>
    <rect x="42" y="41" width="26" height="26"/>
    <text x="55" y="97" font-size="18" stroke="none" fill="currentColor" text-anchor="middle">D</text>
  </g>
</svg>`,

  // Esquema de la Porta del Paradiso: 5 filas x 2 paneles dentro de un marco.
  // Las zonas numeradas permiten preguntar "dónde" sin describirlo con palabras.
  'puerta-paraiso': `
<svg viewBox="0 0 620 380" xmlns="http://www.w3.org/2000/svg" role="img" fill="none" stroke="currentColor" stroke-width="2">
  <g transform="translate(190,15)">
    <rect x="0" y="0" width="240" height="340" stroke-width="2.5"/>
    <rect x="34" y="34" width="172" height="272" stroke-width="2.5"/>
    <g stroke-width="1.8">
      <rect x="42" y="42" width="76" height="48"/><rect x="122" y="42" width="76" height="48"/>
      <rect x="42" y="94" width="76" height="48"/><rect x="122" y="94" width="76" height="48"/>
      <rect x="42" y="146" width="76" height="48"/><rect x="122" y="146" width="76" height="48"/>
      <rect x="42" y="198" width="76" height="48"/><rect x="122" y="198" width="76" height="48"/>
      <rect x="42" y="250" width="76" height="48"/><rect x="122" y="250" width="76" height="48"/>
    </g>
    <g class="figura__acento" font-size="17" text-anchor="middle" stroke-width="2">
      <circle cx="80" cy="66" r="13" fill="none"/><text x="80" y="72" stroke="none" fill="currentColor">1</text>
      <circle cx="17" cy="170" r="13" fill="none"/><text x="17" y="176" stroke="none" fill="currentColor">2</text>
      <circle cx="120" cy="17" r="13" fill="none"/><text x="120" y="23" stroke="none" fill="currentColor">3</text>
      <circle cx="120" cy="323" r="13" fill="none"/><text x="120" y="329" stroke="none" fill="currentColor">4</text>
    </g>
  </g>
</svg>`,

  // Tres maneras de cerrar un vano. Los puntos marcan desde dónde se traza
  // cada curva: uno solo en el de medio punto, dos en el apuntado. La
  // herradura es el señuelo (no existe en la Florencia gótica).
  'tipos-arco': `
<svg viewBox="0 0 620 260" xmlns="http://www.w3.org/2000/svg" role="img" fill="none" stroke="currentColor" stroke-width="2.5">
  <g transform="translate(10,0)">
    <path d="M 40 200 L 40 140 A 60 60 0 0 1 160 140 L 160 200"/>
    <line x1="40" y1="200" x2="40" y2="230"/><line x1="160" y1="200" x2="160" y2="230"/>
    <line x1="20" y1="230" x2="180" y2="230"/>
    <line class="figura__acento" x1="40" y1="140" x2="160" y2="140" stroke-width="1.2" stroke-dasharray="4 4"/>
    <circle class="figura__acento" cx="100" cy="140" r="3.5" stroke="none" fill="currentColor"/>
    <text x="100" y="253" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">A</text>
  </g>
  <g transform="translate(210,0)">
    <path d="M 40 200 L 40 160 A 120 120 0 0 1 100 62 A 120 120 0 0 1 160 160 L 160 200"/>
    <line x1="40" y1="200" x2="40" y2="230"/><line x1="160" y1="200" x2="160" y2="230"/>
    <line x1="20" y1="230" x2="180" y2="230"/>
    <line class="figura__acento" x1="40" y1="160" x2="160" y2="160" stroke-width="1.2" stroke-dasharray="4 4"/>
    <circle class="figura__acento" cx="40" cy="160" r="3.5" stroke="none" fill="currentColor"/>
    <circle class="figura__acento" cx="160" cy="160" r="3.5" stroke="none" fill="currentColor"/>
    <text x="100" y="253" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">B</text>
  </g>
  <g transform="translate(410,0)">
    <path d="M 52 200 L 52 150 A 56 56 0 1 1 148 150 L 148 200"/>
    <line x1="52" y1="200" x2="52" y2="230"/><line x1="148" y1="200" x2="148" y2="230"/>
    <line x1="20" y1="230" x2="180" y2="230"/>
    <circle class="figura__acento" cx="100" cy="150" r="3.5" stroke="none" fill="currentColor"/>
    <text x="100" y="253" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">C</text>
  </g>
</svg>`,

  // Cuatro remates de muro. A cuadrada (güelfa) y B cola de golondrina
  // (gibelina) son las dos que existen de verdad en Florencia.
  'almenas': `
<svg viewBox="0 0 620 200" xmlns="http://www.w3.org/2000/svg" role="img" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">
  <g transform="translate(15,0)">
    <path d="M 5 150 L 5 60 L 40 60 L 40 95 L 75 95 L 75 60 L 110 60 L 110 150"/>
    <text x="57" y="186" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">A</text>
  </g>
  <g transform="translate(165,0)">
    <path d="M 5 150 L 5 55 L 22 78 L 40 55 L 40 95 L 75 95 L 75 55 L 92 78 L 110 55 L 110 150"/>
    <text x="57" y="186" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">B</text>
  </g>
  <g transform="translate(315,0)">
    <path d="M 5 150 L 5 78 A 17.5 17.5 0 0 1 40 78 L 40 95 L 75 95 L 75 78 A 17.5 17.5 0 0 1 110 78 L 110 150"/>
    <text x="57" y="186" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">C</text>
  </g>
  <g transform="translate(465,0)">
    <path d="M 5 150 L 5 80 L 20 80 L 20 60 L 50 60 L 50 80 L 65 80 L 65 95 L 80 95 L 80 80 L 95 80 L 95 60 L 110 60 L 110 150"/>
    <text x="57" y="186" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">D</text>
  </g>
</svg>`,

  // Flor de lis francesa (A) frente al giglio florentino (B), que añade dos
  // estambres con botón entre los pétalos. Ambos en el mismo trazo: la
  // diferencia es estructural, no de color, para que aguante el blanco y negro.
  'giglio': `
<svg viewBox="0 0 620 290" xmlns="http://www.w3.org/2000/svg" role="img" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">
  <g transform="translate(80,15)">
    <path d="M 80 15 C 66 48 62 78 80 108 C 98 78 94 48 80 15 Z"/>
    <path d="M 74 104 C 52 100 30 88 22 68 C 16 52 34 44 42 58 C 50 74 58 92 74 104 Z"/>
    <path d="M 86 104 C 108 100 130 88 138 68 C 144 52 126 44 118 58 C 110 74 102 92 86 104 Z"/>
    <rect x="52" y="108" width="56" height="13"/>
    <path d="M 80 121 L 80 175"/>
    <path d="M 66 121 C 60 145 52 160 40 172"/>
    <path d="M 94 121 C 100 145 108 160 120 172"/>
    <text x="80" y="256" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">A</text>
  </g>
  <g transform="translate(350,15)">
    <path d="M 80 15 C 66 48 62 78 80 108 C 98 78 94 48 80 15 Z"/>
    <path d="M 74 104 C 52 100 30 88 22 68 C 16 52 34 44 42 58 C 50 74 58 92 74 104 Z"/>
    <path d="M 86 104 C 108 100 130 88 138 68 C 144 52 126 44 118 58 C 110 74 102 92 86 104 Z"/>
    <path d="M 60 100 C 52 80 50 62 54 46"/>
    <ellipse cx="55" cy="39" rx="7" ry="9"/>
    <path d="M 100 100 C 108 80 110 62 106 46"/>
    <ellipse cx="105" cy="39" rx="7" ry="9"/>
    <rect x="52" y="108" width="56" height="13"/>
    <path d="M 80 121 L 80 175"/>
    <path d="M 66 121 C 60 145 52 160 40 172"/>
    <path d="M 94 121 C 100 145 108 160 120 172"/>
    <text x="80" y="256" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">B</text>
  </g>
</svg>`,
  // Cuatro cruces con la misma altura para que solo las distinga la forma.
  // La occitana (D) es griega, de brazos que se ensanchan, con tres pommettes
  // por brazo — doce en total.
  'cruces': `
<svg viewBox="0 0 620 230" xmlns="http://www.w3.org/2000/svg" role="img" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">
  <g transform="translate(75,95)">
    <path d="M -10 -52 L 10 -52 L 10 -22 L 32 -22 L 32 -2 L 10 -2 L 10 52 L -10 52 L -10 -2 L -32 -2 L -32 -22 L -10 -22 Z"/>
    <text x="0" y="112" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">A</text>
  </g>
  <g transform="translate(225,95)">
    <path d="M -11 -44 L 11 -44 L 11 -11 L 44 -11 L 44 11 L 11 11 L 11 44 L -11 44 L -11 11 L -44 11 L -44 -11 L -11 -11 Z"/>
    <text x="0" y="112" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">B</text>
  </g>
  <g transform="translate(375,95)">
    <g>
      <path d="M 0 0 L -30 -46 L 0 -30 L 30 -46 Z"/>
      <path d="M 0 0 L -30 -46 L 0 -30 L 30 -46 Z" transform="rotate(90)"/>
      <path d="M 0 0 L -30 -46 L 0 -30 L 30 -46 Z" transform="rotate(180)"/>
      <path d="M 0 0 L -30 -46 L 0 -30 L 30 -46 Z" transform="rotate(270)"/>
    </g>
    <text x="0" y="112" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">C</text>
  </g>
  <g transform="translate(525,95)">
    <path d="M -26 -44 L 26 -44 L 12 -12 L 44 -26 L 44 26 L 12 12 L 26 44 L -26 44 L -12 12 L -44 26 L -44 -26 L -12 -12 Z"/>
    <g>
      <g><circle cx="-22" cy="-50" r="6.5"/><circle cx="0" cy="-50" r="6.5"/><circle cx="22" cy="-50" r="6.5"/></g>
      <g transform="rotate(90)"><circle cx="-22" cy="-50" r="6.5"/><circle cx="0" cy="-50" r="6.5"/><circle cx="22" cy="-50" r="6.5"/></g>
      <g transform="rotate(180)"><circle cx="-22" cy="-50" r="6.5"/><circle cx="0" cy="-50" r="6.5"/><circle cx="22" cy="-50" r="6.5"/></g>
      <g transform="rotate(270)"><circle cx="-22" cy="-50" r="6.5"/><circle cx="0" cy="-50" r="6.5"/><circle cx="22" cy="-50" r="6.5"/></g>
    </g>
    <text x="0" y="112" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">D</text>
  </g>
</svg>`,

  // Tres maneras de colgar campanas: torre exenta, muro-campanario (la
  // fachada misma hace de campanario) y torre octogonal por pisos.
  'campanarios': `
<svg viewBox="0 0 620 250" xmlns="http://www.w3.org/2000/svg" role="img" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">
  <g transform="translate(30,0)">
    <path d="M 40 200 L 40 60 L 70 30 L 100 60 L 100 200"/>
    <path d="M 55 100 L 55 85 A 15 15 0 0 1 85 85 L 85 100 Z"/>
    <path d="M 55 145 L 55 130 A 15 15 0 0 1 85 130 L 85 145 Z"/>
    <line x1="20" y1="200" x2="120" y2="200"/>
    <text x="70" y="232" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">A</text>
  </g>
  <g transform="translate(215,0)">
    <path d="M 20 200 L 20 45 L 32 45 L 32 32 L 44 32 L 44 45 L 146 45 L 146 32 L 158 32 L 158 45 L 170 45 L 170 200"/>
    <g>
      <path d="M 42 118 L 42 96 A 14 14 0 0 1 70 96 L 70 118 Z"/>
      <path d="M 81 118 L 81 96 A 14 14 0 0 1 109 96 L 109 118 Z"/>
      <path d="M 120 118 L 120 96 A 14 14 0 0 1 148 96 L 148 118 Z"/>
      <path d="M 42 172 L 42 150 A 14 14 0 0 1 70 150 L 70 172 Z"/>
      <path d="M 81 172 L 81 150 A 14 14 0 0 1 109 150 L 109 172 Z"/>
      <path d="M 120 172 L 120 150 A 14 14 0 0 1 148 150 L 148 172 Z"/>
    </g>
    <line x1="8" y1="200" x2="182" y2="200"/>
    <text x="95" y="232" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">B</text>
  </g>
  <g transform="translate(440,0)">
    <path d="M 40 200 L 40 130 L 130 130 L 130 200"/>
    <path d="M 48 130 L 48 90 L 122 90 L 122 130"/>
    <path d="M 56 90 L 56 56 L 114 56 L 114 90"/>
    <path d="M 85 20 L 114 56 L 56 56 Z"/>
    <path d="M 62 122 L 62 106 A 10 10 0 0 1 82 106 L 82 122 Z"/>
    <path d="M 90 122 L 90 106 A 10 10 0 0 1 110 106 L 110 122 Z"/>
    <path d="M 72 82 L 72 70 A 9 9 0 0 1 90 70 L 90 82 Z"/>
    <line x1="25" y1="200" x2="145" y2="200"/>
    <text x="85" y="232" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">C</text>
  </g>
</svg>`,

  // Tres remates de vano que se parecen pero se trazan distinto: el de medio
  // punto (curva única), el apuntado (dos curvas en pico) y el mitrado (dos
  // rectas, como una mitra de obispo). B es el señuelo: es el gótico "de
  // manual", pero no es lo que corona Saint-Sernin.
  'arcos-mitrado': `
<svg viewBox="0 0 620 260" xmlns="http://www.w3.org/2000/svg" role="img" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">
  <g transform="translate(10,0)">
    <path d="M 40 200 L 40 140 A 60 60 0 0 1 160 140 L 160 200"/>
    <line x1="40" y1="200" x2="40" y2="230"/><line x1="160" y1="200" x2="160" y2="230"/>
    <line x1="20" y1="230" x2="180" y2="230"/>
    <text x="100" y="253" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">A</text>
  </g>
  <g transform="translate(210,0)">
    <path d="M 40 200 L 40 160 A 120 120 0 0 1 100 62 A 120 120 0 0 1 160 160 L 160 200"/>
    <line x1="40" y1="200" x2="40" y2="230"/><line x1="160" y1="200" x2="160" y2="230"/>
    <line x1="20" y1="230" x2="180" y2="230"/>
    <text x="100" y="253" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">B</text>
  </g>
  <g transform="translate(410,0)">
    <path d="M 40 200 L 40 150 L 100 72 L 160 150 L 160 200"/>
    <line x1="40" y1="200" x2="40" y2="230"/><line x1="160" y1="200" x2="160" y2="230"/>
    <line x1="20" y1="230" x2="180" y2="230"/>
    <text x="100" y="253" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">C</text>
  </g>
</svg>`,

  // Tres bóvedas vistas desde abajo: cañón (sin nervios), crucería simple
  // (dos nervios cruzados) y palmera (muchos nervios saliendo de un punto).
  'bovedas': `
<svg viewBox="0 0 620 240" xmlns="http://www.w3.org/2000/svg" role="img" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">
  <g transform="translate(50,0)">
    <rect x="10" y="30" width="130" height="130"/>
    <g stroke-width="1.8">
      <line x1="10" y1="62" x2="140" y2="62"/>
      <line x1="10" y1="95" x2="140" y2="95"/>
      <line x1="10" y1="128" x2="140" y2="128"/>
    </g>
    <text x="75" y="196" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">A</text>
  </g>
  <g transform="translate(240,0)">
    <rect x="10" y="30" width="130" height="130"/>
    <line x1="10" y1="30" x2="140" y2="160"/>
    <line x1="140" y1="30" x2="10" y2="160"/>
    <circle cx="75" cy="95" r="5" fill="currentColor" stroke="none"/>
    <text x="75" y="196" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">B</text>
  </g>
  <g transform="translate(430,0)">
    <rect x="10" y="30" width="130" height="130"/>
    <g stroke-width="1.8">
      <line x1="75" y1="160" x2="10" y2="30"/>
      <line x1="75" y1="160" x2="27" y2="30"/>
      <line x1="75" y1="160" x2="44" y2="30"/>
      <line x1="75" y1="160" x2="61" y2="30"/>
      <line x1="75" y1="160" x2="75" y2="30"/>
      <line x1="75" y1="160" x2="89" y2="30"/>
      <line x1="75" y1="160" x2="106" y2="30"/>
      <line x1="75" y1="160" x2="123" y2="30"/>
      <line x1="75" y1="160" x2="140" y2="30"/>
      <line x1="75" y1="160" x2="10" y2="95"/>
      <line x1="75" y1="160" x2="140" y2="95"/>
    </g>
    <circle cx="75" cy="160" r="5" fill="currentColor" stroke="none"/>
    <text x="75" y="196" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">C</text>
  </g>
</svg>`,
  // Tres maneras de volar. La de plumas y la de membrana se distinguen a
  // simple vista en cualquier talla heráldica: es la diferencia entre un
  // águila y un murciélago.
  'alas': `
<svg viewBox="0 0 620 230" xmlns="http://www.w3.org/2000/svg" role="img" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round">
  <g transform="translate(20,25)">
    <g transform="rotate(8 10 20)"><ellipse cx="70" cy="20" rx="58" ry="9"/></g>
    <g transform="rotate(19 10 20)"><ellipse cx="70" cy="20" rx="58" ry="9"/></g>
    <g transform="rotate(30 10 20)"><ellipse cx="70" cy="20" rx="58" ry="9"/></g>
    <g transform="rotate(41 10 20)"><ellipse cx="70" cy="20" rx="58" ry="9"/></g>
    <g transform="rotate(52 10 20)"><ellipse cx="70" cy="20" rx="58" ry="9"/></g>
    <g transform="rotate(63 10 20)"><ellipse cx="70" cy="20" rx="58" ry="9"/></g>
    <text x="80" y="200" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">A</text>
  </g>
  <g transform="translate(230,25)">
    <path d="M 10 20 L 150 35 Q 128 50 140 80 Q 112 92 115 120 Q 88 126 75 145 Q 40 95 10 20 Z"/>
    <path d="M 10 20 L 140 80"/>
    <path d="M 10 20 L 115 120"/>
    <path d="M 10 20 L 75 145"/>
    <text x="80" y="200" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">B</text>
  </g>
  <g transform="translate(440,25)">
    <g transform="rotate(28 20 30)">
      <ellipse cx="95" cy="30" rx="80" ry="33"/>
      <g stroke-width="1.4">
        <path d="M 22 30 C 60 12 120 8 172 24"/>
        <path d="M 22 30 C 60 30 120 32 174 32"/>
        <path d="M 22 30 C 60 48 120 52 170 40"/>
      </g>
    </g>
    <text x="80" y="200" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">C</text>
  </g>
</svg>`,

  // Secciones de pilar vistas en planta. La octogonal es la del gótico
  // catalán; la cruciforme, la del gótico del norte.
  'secciones-columna': `
<svg viewBox="0 0 620 210" xmlns="http://www.w3.org/2000/svg" role="img" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">
  <g transform="translate(85,85)">
    <circle cx="0" cy="0" r="45"/>
    <text x="0" y="105" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">A</text>
  </g>
  <g transform="translate(235,85)">
    <rect x="-40" y="-40" width="80" height="80"/>
    <text x="0" y="105" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">B</text>
  </g>
  <g transform="translate(385,85)">
    <path d="M 41.6 -17.2 L 41.6 17.2 L 17.2 41.6 L -17.2 41.6 L -41.6 17.2 L -41.6 -17.2 L -17.2 -41.6 L 17.2 -41.6 Z"/>
    <text x="0" y="105" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">C</text>
  </g>
  <g transform="translate(535,85)">
    <path d="M -18 -45 L 18 -45 L 18 -18 L 45 -18 L 45 18 L 18 18 L 18 45 L -18 45 L -18 18 L -45 18 L -45 -18 L -18 -18 Z"/>
    <text x="0" y="105" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">D</text>
  </g>
</svg>`,

  // Cuatro hojas que la escultura y la forja repiten sin parar. La hiedra
  // (A) tiene tres lóbulos en punta y base acorazonada.
  'hojas': `
<svg viewBox="0 0 620 230" xmlns="http://www.w3.org/2000/svg" role="img" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">
  <g transform="translate(85,90)">
    <path d="M 0 -50 C 6 -34 10 -22 14 -14 C 22 -24 34 -30 42 -26 C 44 -10 30 8 14 18
             C 8 24 4 28 0 34 C -4 28 -8 24 -14 18 C -30 8 -44 -10 -42 -26
             C -34 -30 -22 -24 -14 -14 C -10 -22 -6 -34 0 -50 Z"/>
    <path d="M 0 34 L 0 56"/>
    <text x="0" y="108" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">A</text>
  </g>
  <g transform="translate(235,90)">
    <path d="M 0 -50 C 13 -46 15 -35 8 -31 C 18 -28 21 -17 11 -13 C 22 -10 24 2 13 6 C 23 11 22 23 11 26 C 16 34 9 42 0 44
             C -9 42 -16 34 -11 26 C -22 23 -23 11 -13 6 C -24 2 -22 -10 -11 -13 C -21 -17 -18 -28 -8 -31 C -15 -35 -13 -46 0 -50 Z"/>
    <path d="M 0 44 L 0 58"/>
    <text x="0" y="108" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">B</text>
  </g>
  <g transform="translate(385,90)">
    <path d="M 0 -50 C 13 -30 13 20 0 42 C -13 20 -13 -30 0 -50 Z"/>
    <path d="M 0 -40 L 0 34"/>
    <path d="M 0 42 L 0 58"/>
    <text x="0" y="108" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">C</text>
  </g>
  <g transform="translate(535,90)">
    <path d="M 0 40 L -34 -18 A 40 40 0 0 1 34 -18 Z"/>
    <path d="M 0 40 L 0 -22"/>
    <path d="M 0 40 L 0 58"/>
    <text x="0" y="108" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">D</text>
  </g>
</svg>`,

  // Tres capiteles clásicos de frente: el liso, el de volutas y el de hojas
  // de acanto. Es el detalle que fecha una columna de un vistazo.
  'capiteles': `
<svg viewBox="0 0 620 250" xmlns="http://www.w3.org/2000/svg" role="img" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">
  <g transform="translate(40,0)">
    <rect x="18" y="46" width="104" height="16"/>
    <path d="M 30 62 C 30 86 40 92 40 100 L 100 100 C 100 92 110 86 110 62 Z"/>
    <path d="M 44 100 L 44 200"/><path d="M 96 100 L 96 200"/>
    <line x1="30" y1="200" x2="110" y2="200"/>
    <text x="70" y="238" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">A</text>
  </g>
  <g transform="translate(245,0)">
    <rect x="18" y="40" width="104" height="12"/>
    <path d="M 24 52 L 116 52 L 116 66 L 24 66 Z"/>
    <g stroke-width="2.2">
      <circle cx="40" cy="80" r="15"/><circle cx="40" cy="80" r="5"/>
      <circle cx="100" cy="80" r="15"/><circle cx="100" cy="80" r="5"/>
      <path d="M 55 74 C 62 66 78 66 85 74"/>
    </g>
    <path d="M 40 95 L 40 100 L 100 100 L 100 95"/>
    <path d="M 46 100 L 46 200"/><path d="M 94 100 L 94 200"/>
    <line x1="32" y1="200" x2="108" y2="200"/>
    <text x="70" y="238" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">B</text>
  </g>
  <g transform="translate(450,0)">
    <path d="M 14 34 C 40 44 100 44 126 34 L 126 50 C 100 60 40 60 14 50 Z"/>
    <path d="M 26 50 C 26 84 40 94 40 104 L 100 104 C 100 94 114 84 114 50"/>
    <g stroke-width="2">
      <path d="M 40 56 C 34 68 36 80 44 88 C 52 80 50 66 46 56"/>
      <path d="M 70 58 C 62 70 64 84 70 92 C 76 84 78 70 70 58"/>
      <path d="M 100 56 C 106 68 104 80 96 88 C 88 80 90 66 94 56"/>
      <path d="M 30 60 C 26 74 30 86 38 94"/>
      <path d="M 110 60 C 114 74 110 86 102 94"/>
    </g>
    <path d="M 46 104 L 46 200"/><path d="M 94 104 L 94 200"/>
    <line x1="32" y1="200" x2="108" y2="200"/>
    <text x="70" y="238" font-size="20" stroke="none" fill="currentColor" text-anchor="middle">C</text>
  </g>
</svg>`,
};

/** Devuelve el SVG de una figura, o cadena vacía si la parada no tiene. */
export function figuraSvg(figuraId) {
  if (!figuraId) return '';
  return FIGURAS[figuraId] || '';
}

export function existeFigura(figuraId) {
  return Boolean(figuraId && FIGURAS[figuraId]);
}
