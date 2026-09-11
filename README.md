# Heart

**EN** — Heart is a Windows desktop optimization utility (Electron + React + TypeScript) with a red/black liquid-glass UI.

**FR** — Heart est un utilitaire d'optimisation Windows (Electron + React + TypeScript) avec une interface liquid-glass rouge/noir.

## Requirements / Prérequis

- Windows 10/11
- Node.js 20+ (tested on v24)
- npm

## Install

```bash
cd Heart
npm install
```

## Development / Développement

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Package (NSIS Setup.exe)

```bash
npm run dist
```

Artifacts are written to `release/`:
- `Heart-Setup-1.0.0.exe` — NSIS installer (desktop shortcut)
- `Heart-1.0.0-portable.exe` — portable build

## Features / Fonctionnalités

- Splash screen with branding wordmark
- Auto locale: `fr*` → French, else English (full i18n)
- Pages: Accueil / Home, Optimisation, Nettoyage / Cleanup, Aide / Help
- 15 reversible Windows tweaks (registry / powercfg / services) with UAC elevation when needed
- Safe cleaner: `%TEMP%`, `Windows\Temp`, Prefetch (best-effort), cleanmgr, Recycle Bin — never Documents
- Frameless window with custom title bar

## Safety notes / Sécurité

- **Remove Microsoft Edge** is intentionally **guarded / experimental**: Heart does **not** force-uninstall Edge (breaks WebView2). It only disables Edge startup boost policy after confirmation.
- Bloatware removal uses a **conservative** UWP list only.
- Services tweak uses a **safe subset** only.
- No app telemetry.

## License

MIT
