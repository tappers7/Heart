import type { Dict } from './en'

export const fr: Dict = {
  appName: 'Heart',
  tagline: 'Optimisez Windows avec des tweaks de performance soigneusement sélectionnés.',
  nav: {
    home: 'Accueil',
    optimisation: 'Optimisation',
    nettoyage: 'Nettoyage',
    aide: 'Aide'
  },
  window: { minimize: 'Réduire', maximize: 'Agrandir', close: 'Fermer' },
  home: {
    welcome: 'Bienvenue sur Heart',
    subtitle: 'Performance. Clarté. Contrôle.',
    cta: 'Ouvrir Optimisation'
  },
  optimisation: {
    title: 'Optimisation',
    subtitle: 'Optimisez votre système avec des tweaks soigneusement sélectionnés.',
    applied: '{n}/{total} tweaks appliqués',
    applyAll: 'Tout appliquer',
    revertAll: 'Tout annuler',
    search: 'Rechercher…',
    refresh: 'Actualiser',
    filters: {
      all: 'Tous',
      telemetry: 'Télémétrie',
      performance: 'Performance',
      visual: 'Visuel',
      latency: 'Latence',
      network: 'Réseau'
    },
    badge: {
      recommended: 'Recommandé',
      optional: 'Optionnel',
      highRisk: 'Haut risque',
      experimental: 'Expérimental',
      oneShot: 'Unique'
    },
    apply: 'Appliquer',
    revert: 'Annuler',
    running: 'En cours…',
    confirmEdgeTitle: 'Supprimer Microsoft Edge — Haut risque',
    confirmEdgeMessage:
      "Désinstaller Edge peut casser WebView2 et des composants Windows. Heart n'appliquera qu'une limitation expérimentale gardée (désactiver le startup boost), pas une désinstallation forcée. Continuer ?"
  },
  tweaks: {
    'disable-telemetry': {
      title: 'Désactiver la télémétrie',
      desc: "Coupe l'envoi de rapports d'usage et de diagnostics à Microsoft (AllowTelemetry = 0)."
    },
    'remove-bloatware': {
      title: 'Supprimer les bloatwares (UWP)',
      desc: 'Désinstalle les apps préinstallées inutiles (liste conservative). Action unique.'
    },
    'classic-context-menu': {
      title: 'Menu contextuel classique',
      desc: 'Restaure le menu contextuel Win10 complet sous Windows 11.'
    },
    'disable-bing-search': {
      title: 'Désactiver Bing dans Démarrer',
      desc: 'Empêche Bing dans le menu Démarrer et les suggestions web.'
    },
    'security-only-updates': {
      title: 'Mises à jour sécurité uniquement',
      desc: "Retarde les feature updates d'un an tout en gardant les correctifs de sécurité."
    },
    'services-manual': {
      title: 'Services en manuel',
      desc: 'Services non essentiels en manuel (sous-ensemble sûr uniquement).'
    },
    'ultimate-performance': {
      title: 'Plan Ultimate Performance',
      desc: 'Débloque le profil Ultimate Performance et l’active.'
    },
    'remove-edge': {
      title: 'Supprimer Microsoft Edge',
      desc: 'HAUT RISQUE — expérimental gardé : n’éradique pas Edge (casse WebView2). Désactive seulement le startup boost.'
    },
    'tcp-nagle-off': {
      title: 'Optimisation TCP/IP (Nagle Off)',
      desc: 'Désactive Nagle (TcpAckFrequency / TCPNoDelay) pour réduire la latence.'
    },
    'ram-standby-purge': {
      title: 'Purge cache standby RAM',
      desc: 'Vide le cache standby (best-effort, action unique). Clear complet = EmptyStandbyList.'
    },
    'disable-core-parking': {
      title: 'Désactiver le core parking',
      desc: 'Empêche core parking (CPMINCORES = 100 %) pour moins de latence.'
    },
    'disable-transparency': {
      title: 'Désactiver la transparence',
      desc: 'Désactive acrylique/mica pour économiser le GPU.'
    },
    'disable-animations': {
      title: 'Désactiver les animations',
      desc: 'Supprime animations fenêtres et barre des tâches.'
    },
    'remove-gallery': {
      title: 'Supprimer la Galerie',
      desc: 'Supprime Galerie Explorateur du volet de navigation.'
    },
    'remove-home-quickaccess': {
      title: 'Accueil / Accès rapide',
      desc: 'Ouvre sur Ce PC et masque les éléments récents/fréquents.'
    }
  },
  nettoyage: {
    title: 'Nettoyage',
    subtitle: 'Nettoyez les fichiers temporaires en toute sécurité. Documents jamais touchés.',
    description:
      'Vide %TEMP%, Windows\\Temp, Prefetch (best-effort), lance le Nettoyage de disque et vide la Corbeille.',
    clean: 'Nettoyer',
    cleaning: 'Nettoyage…',
    result: 'Résultat',
    neverDocs: 'Documents, Bureau et fichiers utilisateur ne sont jamais modifiés.'
  },
  aide: {
    title: 'Aide',
    subtitle: 'Correctifs rapides pour problèmes Windows courants.',
    comingSoon: 'Bientôt disponible',
    runFix: 'Lancer',
    cards: [
      { title: 'Correctif WiFi', desc: 'Met WLAN AutoConfig et services liés en démarrage automatique.' },
      { title: 'Correctif Bluetooth', desc: 'Redémarre les services Bluetooth et réinitialise la pile radio.' },
      { title: 'Panneau NVIDIA', desc: 'Astuces pour lancer le panneau de configuration NVIDIA classique.' },
      { title: 'Erreur 2502/2503', desc: 'Corrige les permissions du dossier Temp de Windows Installer.' },
      { title: 'Réactiver Defender', desc: 'Aide pour restaurer Microsoft Defender s’il est désactivé.' },
      { title: 'Reset réseau', desc: 'Helpers documentés pour réinitialiser la pile réseau Windows.' }
    ]
  },
  splash: { loading: 'Chargement de Heart…' }
}
