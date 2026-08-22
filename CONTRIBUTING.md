# Contribuir

## Mensajes de commit

Todos los commits de este repositorio deben:

- **Escribirse en inglés.**
- **Seguir [Conventional Commits](https://www.conventionalcommits.org/):**

  ```
  <tipo>[alcance opcional]: <descripción>
  ```

Tipos más usados en este proyecto: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`.

Ejemplos:

```
feat: add species detail page
fix: correct light preference icon
docs: document firebase deploy secrets
chore: bump next to 16.3.1
```

Reglas de estilo:

- Descripción en minúscula y en modo imperativo ("add", no "added" ni "adds").
- Sin punto final en la descripción.
- Para cambios que rompen compatibilidad, usa `!` después del tipo/alcance (p. ej. `feat!: ...`) o un footer `BREAKING CHANGE: ...`.
- Si el cuerpo del commit necesita más contexto, agrégalo como párrafos adicionales después de una línea en blanco (también en inglés).
