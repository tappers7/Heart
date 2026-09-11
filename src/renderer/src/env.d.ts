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
      isElevated: () => Promise<boolean>
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
      listBloatware: () => Promise<
        { name: string; packageFullName: string; installed: boolean; selectedByDefault: boolean }[]
      >
      removeBloatware: (
        names: string[]
      ) => Promise<{ ok: boolean; message: string; removed: string[] }>
      runCleanup: () => Promise<{
        ok: boolean
        cleared: { path: string; files: number; bytes: number; error?: string }[]
        recycleBin: boolean
        cleanmgrStarted: boolean
        summary: string
      }>
    }
  }
}

export {}
