# Stitch MCP — intégration Cursor

## Pourquoi un proxy local ?

Cursor a un bug connu avec les MCP distants (`url: https://stitch.googleapis.com/mcp`) : erreur `Invalid URL protocol` / OAuth discovery.  
De plus, `tools/list` Stitch est trop volumineux (~280 KB) et Cursor peut afficher **0 tools**.

Solution : proxy **stdio** local qui :

1. Parle MCP à Cursor via stdin/stdout
2. Transmet les appels à l’API Stitch avec `X-Goog-Api-Key`
3. Réduit le payload (`outputSchema` retiré, enums tronqués) pour que les tools s’enregistrent

## Fichiers

| Fichier | Rôle |
|---|---|
| `.cursor/stitch-mcp-proxy.mjs` | Proxy MCP stdio |
| `.cursor/mcp.json` | Config workspace Cursor |
| `~/.cursor/mcp.json` | Config globale Cursor (inclut aussi Supabase) |

## Config

```json
{
  "mcpServers": {
    "stitch": {
      "command": "node",
      "args": ["/home/sahbani/jobs/gmao/.cursor/stitch-mcp-proxy.mjs"],
      "env": {
        "STITCH_API_KEY": "<clé API Stitch>"
      }
    }
  }
}
```

Clé API : [stitch.withgoogle.com/settings](https://stitch.withgoogle.com/settings) → API Keys.

## Activation dans Cursor

1. **Cursor Settings → MCP** (ou Command Palette → “MCP”)
2. Vérifier que le serveur **stitch** apparaît
3. Si besoin : **Reload Window** / redémarrer Cursor
4. Le point doit être vert et les tools listés (~15)

## Tools exposés (smoke test OK)

- `list_projects`, `get_project`, `create_project`, `delete_project`
- `list_screens`, `get_screen`
- `generate_screen_from_text`, `edit_screens`, `generate_variants`
- `upload_design_md`, `create_design_system`, `create_design_system_from_design_md`, `update_design_system`, `list_design_systems`, `apply_design_system`

Projet GMAO cible : **GMAO Inserter Performance Tracker** (`projects/13537135584261273264`).

## Test manuel

```bash
export STITCH_API_KEY="..."
node --input-type=module -e '
import { spawn } from "node:child_process";
const c = spawn("node", [".cursor/stitch-mcp-proxy.mjs"], { env: process.env, stdio: ["pipe","pipe","inherit"] });
c.stdin.write(JSON.stringify({jsonrpc:"2.0",id:1,method:"tools/list",params:{}})+"\n");
c.stdout.on("data", d => { console.log(d.toString()); c.kill(); });
'
```

## Debug

```bash
STITCH_PROXY_DEBUG=1 STITCH_API_KEY=... node .cursor/stitch-mcp-proxy.mjs
```

Les logs partent sur **stderr** (ne polluent pas le protocole MCP).

## Sécurité

Ne pas committer `mcp.json` avec la clé API. Préférer un secret local / variable d’environnement non versionnée.
