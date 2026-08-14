# DESIGN.md — sync Stitch

## Résumé

`DESIGN.md` à la racine contient le design system **Industrial Precision** synchronisé depuis le projet Stitch **GMAO Inserter Performance Tracker** (`projects/13537135584261273264`).

## Contenu clé

- Palette : primary `#00236f` / `#1e3a8a`, secondary orange `#fd761a`, tertiary vert succès
- Typo : Inter (KPI, headlines, body, label-caps, tabular-nums)
- Spacing : base 4px, touch targets ≥ 44px
- Composants : boutons, badges statut, data cards, inputs, tables

## Resync

```bash
# Via proxy MCP local : get_project → designTheme.designMd
# Puis écraser DESIGN.md avec le contenu retourné
```

Référence technique : `docs/stitch-mcp-cursor.md`
