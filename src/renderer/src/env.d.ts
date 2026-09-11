/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    heart: {
      minimize: () => void
      maximize: () => void
      close: () => void
      isMaximized: () => Promise<boolean>
      getLocale: () => Promise<string>
      getTweakStates: () => Promise<
        {
          id: string
          applied: boolean
          detail?: string
          oneShot?: boolean
          highRisk?: boolean
          experimental?: boolean
        }[]
      >
      applyTweak: (id: string) => Promise<{ ok: boolean; message: string }>
      revertTweak: (id: string) => Promise<{ ok: boolean; message: string }>
      runCleanup: () => Promise<{
        ok: boolean
        cleared: { path: string; files: number; bytes: number; error?: string }[]
        recycleBin: boolean
        cleanmgrStarted: boolean
        summary: string
      }>
      confirm: (opts: { title: string; message: string }) => Promise<boolean>
    }
  }
}

export {}
