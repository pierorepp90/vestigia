-- Votación de próxima ciudad + devoluciones post-ruta.
-- Ver docs/superpowers/specs/2026-09-02-votacion-devoluciones-design.md

CREATE TABLE voto_opciones (
  id              TEXT PRIMARY KEY,
  etiqueta        TEXT NOT NULL,          -- JSON {"es":...,"en":...,"fr":...,"it":...}
  estado          TEXT NOT NULL,          -- oficial | aprobada | pendiente | rechazada
  propuesta_email TEXT,
  nota            TEXT,
  creada_en       INTEGER NOT NULL
);

CREATE TABLE votos (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  opcion_id TEXT NOT NULL REFERENCES voto_opciones(id),
  votante   TEXT NOT NULL,
  ip_hash   TEXT NOT NULL,
  estado    TEXT NOT NULL,                -- activo | en_espera
  creado_en INTEGER NOT NULL
);
CREATE UNIQUE INDEX idx_votos_votante ON votos(votante);
CREATE INDEX idx_votos_ip_hash ON votos(ip_hash);
CREATE INDEX idx_votos_opcion ON votos(opcion_id);

CREATE TABLE devoluciones (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ruta_id    TEXT NOT NULL,
  order_id   TEXT NOT NULL,
  idioma     TEXT NOT NULL,
  valoracion INTEGER NOT NULL,
  categoria  TEXT NOT NULL,
  texto      TEXT NOT NULL,
  email      TEXT,
  creado_en  INTEGER NOT NULL
);
CREATE INDEX idx_devoluciones_ruta ON devoluciones(ruta_id);

INSERT INTO voto_opciones (id, etiqueta, estado, creada_en) VALUES
  ('praga',     '{"es":"Praga","en":"Prague","fr":"Prague","it":"Praga"}',             'oficial', 0),
  ('amsterdam', '{"es":"Ámsterdam","en":"Amsterdam","fr":"Amsterdam","it":"Amsterdam"}','oficial', 0),
  ('viena',     '{"es":"Viena","en":"Vienna","fr":"Vienne","it":"Vienna"}',             'oficial', 0),
  ('atenas',    '{"es":"Atenas","en":"Athens","fr":"Athènes","it":"Atene"}',            'oficial', 0),
  ('budapest',  '{"es":"Budapest","en":"Budapest","fr":"Budapest","it":"Budapest"}',    'oficial', 0),
  ('dublin',    '{"es":"Dublín","en":"Dublin","fr":"Dublin","it":"Dublino"}',           'oficial', 0);
