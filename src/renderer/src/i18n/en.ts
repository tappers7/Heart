export const en = {
  appName: 'Heart',
  tagline: 'Optimize your Windows system with carefully curated performance tweaks.',
  nav: {
    home: 'Home',
    optimisation: 'Optimisation',
    nettoyage: 'Cleanup',
    aide: 'Help'
  },
  window: { minimize: 'Minimize', maximize: 'Maximize', close: 'Close' },
  home: {
    welcome: 'Welcome to Heart',
    subtitle: 'Performance. Clarity. Control.',
    cta: 'Open Optimisation'
  },
  optimisation: {
    title: 'Optimisation',
    subtitle: 'Optimize your system with carefully curated performance tweaks.',
    applied: '{n}/{total} tweaks applied',
    applyAll: 'Apply All',
    revertAll: 'Revert All',
    search: 'Search tweaks…',
    refresh: 'Refresh',
    filters: {
      all: 'All',
      telemetry: 'Telemetry',
      performance: 'Performance',
      visual: 'Visual',
      latency: 'Latency',
      network: 'Network'
    },
    badge: { recommended: 'Recommended', optional: 'Optional' },
    apply: 'Apply',
    revert: 'Revert',
    running: 'Working…',
    confirmEdgeTitle: 'Remove Microsoft Edge',
    confirmEdgeMessage:
      'Fully uninstalling Edge can break WebView2 and Windows components. Heart will only apply a guarded limitation (disable startup boost), not a hard uninstall. Continue?',
    detecting: 'Detecting tweak states…',
    success: 'Done',
    failed: 'Something went wrong'
  },
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel'
  },
  bloatware: {
    title: 'Remove Bloatware (UWP)',
    subtitle: 'Select apps to uninstall. Nothing is checked by default — opt in to what you want removed. System-critical apps are never listed.',
    loading: 'Scanning installed apps…',
    search: 'Search apps…',
    empty: 'No matching apps.',
    selectAll: 'Select all',
    selectNone: 'Select none',
    confirm: 'Uninstall selected',
    progress: 'Uninstalling…',
    selectedCount: '{n} selected',
    installed: 'Installed',
    notInstalled: 'Not installed',
    noneSelected: 'Select at least one app.'
  },
  tweaks: {
    'disable-telemetry': {
      title: 'Disable Telemetry & Diagnostic Data',
      desc: 'Stops sending usage and diagnostic reports to Microsoft (AllowTelemetry = 0).'
    },
    'remove-bloatware': {
      title: 'Remove Bloatware (UWP)',
      desc: 'Pick removable Store / UWP apps to uninstall (opt-in). One-shot.'
    },
    'classic-context-menu': {
      title: 'Classic Right-Click Menu',
      desc: 'Restores the Windows 10-style full context menu on Windows 11.'
    },
    'disable-bing-search': {
      title: 'Disable Bing Search in Start',
      desc: 'Prevents Bing web suggestions in the Start menu search box.'
    },
    'security-only-updates': {
      title: 'Security-Only Updates',
      desc: 'Defers feature updates by ~365 days while keeping quality/security updates.'
    },
    'services-manual': {
      title: 'Set Services to Manual',
      desc: 'Sets a safe subset of non-essential services to Manual (never touches critical ones).'
    },
    'ultimate-performance': {
      title: 'Ultimate Performance Power Plan',
      desc: 'Unlocks and activates the Ultimate Performance power scheme.'
    },
    'remove-edge': {
      title: 'Remove Microsoft Edge',
      desc: 'Guarded optional tweak: does not fully uninstall Edge (avoids breaking WebView2). Disables startup boost only.'
    },
    'tcp-nagle-off': {
      title: 'TCP/IP Optimization (Nagle Off)',
      desc: 'Disables Nagle algorithm (TcpAckFrequency / TCPNoDelay) to reduce latency.'
    },
    'ram-standby-purge': {
      title: 'RAM Standby Cache Purge',
      desc: 'One-shot best-effort purge of process working sets. Full standby list clear needs EmptyStandbyList.'
    },
    'disable-core-parking': {
      title: 'Disable Core Parking',
      desc: 'Keeps CPU cores unparked (CPMINCORES = 100%) for lower latency.'
    },
    'disable-transparency': {
      title: 'Disable Transparency',
      desc: 'Turns off acrylic/mica transparency effects to save GPU resources.'
    },
    'disable-animations': {
      title: 'Disable Animations',
      desc: 'Removes window animations and taskbar animation effects.'
    },
    'remove-gallery': {
      title: 'Remove Gallery from File Explorer',
      desc: 'Hides the Gallery entry from the File Explorer navigation pane.'
    },
    'remove-home-quickaccess': {
      title: 'Remove Home / Quick Access',
      desc: 'Opens File Explorer on This PC and hides recent/frequent Quick Access items.'
    }
  },
  nettoyage: {
    title: 'Cleanup',
    subtitle: 'Safely clear temporary files. Documents are never touched.',
    description:
      'Clears %TEMP%, Windows\\Temp, Prefetch (best-effort), starts Disk Cleanup, and empties the Recycle Bin.',
    clean: 'Clean',
    cleaning: 'Cleaning…',
    result: 'Result',
    neverDocs: 'Documents, Desktop, and user files are never modified.'
  },
  aide: {
    title: 'Help',
    subtitle: 'Quick fixes for common Windows issues.',
    comingSoon: 'Coming soon',
    runFix: 'Run Fix',
    cards: [
      { title: 'WiFi Fix', desc: 'Sets WLAN AutoConfig and related services to Automatic startup.' },
      { title: 'Bluetooth Fix', desc: 'Restarts Bluetooth support services and resets radio stack.' },
      { title: 'NVIDIA Control Panel', desc: 'Launch tips for the classic NVIDIA Control Panel.' },
      { title: 'Error 2502/2503 Fix', desc: 'Resolves Windows Installer Temp folder permission issues.' },
      { title: 'Re-Enable Defender', desc: 'Guidance to restore Microsoft Defender if disabled.' },
      { title: 'Network Reset', desc: 'Documented Windows network stack reset helpers.' }
    ]
  },
  splash: { loading: 'Loading Heart…' }
} as const

export type Dict = typeof en
