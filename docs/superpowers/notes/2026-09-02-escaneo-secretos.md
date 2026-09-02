# Escaneo de secretos del historial de git — 2026-09-02

Parte de la Tanda 5 del plan de endurecimiento de seguridad del Worker.

## Herramientas

- `gitleaks` (docker `zricethezav/gitleaks:latest`), `detect` sobre los 81 commits del repo.
- Búsquedas dirigidas con `git log -S` para patrones `sk_live_`, `sk_test_`, `re_`, `TOKEN_SECRET=<hex>`.

## Resultado

**Sin secretos reales expuestos.**

- `.dev.vars` (worker) **nunca** ha estado en el historial (`git log --all --diff-filter=A -- '**/.dev.vars'` vacío). Está en `.gitignore` desde el inicio.
- `git log -S 'sk_live_' / 'sk_test_' / 're_' / 'TOKEN_SECRET=<hex>'`: sin coincidencias con valores reales.
- Los secretos de producción (`TOKEN_SECRET`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, y los nuevos `ADMIN_SECRET` / `IP_SALT` del workstream de votación) viven solo en `wrangler secret` / Cloudflare, nunca en el repo.

### Falso positivo (1)

`gitleaks` marca 1 hallazgo con la regla `curl-auth-header`:

- Fichero: `docs/superpowers/plans/2026-09-02-votacion-devoluciones.md`
- Commit: `b5adcc5` (2026-09-02)
- Contenido: `curl ... -H 'Authorization: Bearer admin-local'` — `admin-local` es el
  valor de ejemplo para `ADMIN_SECRET` en `.dev.vars` **de desarrollo local**,
  documentado en ese plan. No es un secreto real.

No requiere acción. Si en el futuro molesta, añadir una entrada `[allowlist]` a
un `.gitleaks.toml` con el path de ese doc.

## `mint-dev-token.mjs` (Task 5.3)

`worker/scripts/mint-dev-token.mjs` lee `TOKEN_SECRET` de `.dev.vars` en tiempo
de ejecución, no tiene secreto embebido, y vive fuera de `worker/src/` (por lo
que `wrangler deploy`, que empaqueta desde `main = src/index.js`, no lo
incluye). Sin cambios necesarios.

Nota: el campo `v: 1` añadido al token (Task 3.1) invalida los tokens de dev
minteados antes del cambio. Regenerar con `node scripts/mint-dev-token.mjs <ruta>`.

## npm audit (Task 5.2)

Ver resultado en el commit correspondiente; sin vulnerabilidades accionables en
tiempo de ejecución (el Worker no tiene dependencias runtime; `playwright` y
`wrangler` son devDependencies).
