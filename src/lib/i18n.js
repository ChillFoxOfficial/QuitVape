// Simple i18n system for QuitVape
const translations = {
  pt: {
    dashboard: 'Dashboard',
    cravings: 'Desejos',
    game: 'Jogo',
    about: 'Sobre',
    support: 'Apoio',
    darkMode: 'Modo Escuro',
    lightMode: 'Modo Claro',
    logout: 'Sair',
    language: 'Idioma',
    updateData: 'Atualizar Dados',
    welcome: 'Bem-vindo ao QuitVape!',
    needInfo: 'Precisamos de algumas informações para começarmos a acompanhar o teu progresso.',
    startNow: 'Começar Agora',
    supportTitle: 'Apoio ao Cliente',
    supportDesc: 'Como podemos ajudar?',
    faq: 'Perguntas Frequentes',
    contact: 'Contacte-nos',
    email: 'Email',
    phone: 'Telefone',
    hours: 'Horário de Atendimento',
    businessHours: 'Segunda a Sexta, 9h-18h',
    faqQuestion1: 'Como funciona a aplicação?',
    faqAnswer1: 'A QuitVape ajuda-te a rastrear o teu progresso na jornada sem vaping, mostrando estatísticas, economia e benefícios para a saúde.',
    faqQuestion2: 'Como defino a minha data de paragem?',
    faqAnswer2: 'Clica em "Atualizar Dados" no dashboard e introduz a data em que paraste de fazer vaping.',
    faqQuestion3: 'Posso alterar o meu perfil?',
    faqAnswer3: 'Sim, podes atualizar qualquer informação clicando em "Atualizar Dados".',
  },
  en: {
    dashboard: 'Dashboard',
    cravings: 'Cravings',
    game: 'Game',
    about: 'About',
    support: 'Support',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    logout: 'Logout',
    language: 'Language',
    updateData: 'Update Data',
    welcome: 'Welcome to QuitVape!',
    needInfo: 'We need some information to start tracking your progress.',
    startNow: 'Start Now',
    supportTitle: 'Customer Support',
    supportDesc: 'How can we help you?',
    faq: 'Frequently Asked Questions',
    contact: 'Contact Us',
    email: 'Email',
    phone: 'Phone',
    hours: 'Business Hours',
    businessHours: 'Monday to Friday, 9am-6pm',
    faqQuestion1: 'How does the app work?',
    faqAnswer1: 'QuitVape helps you track your progress on your vape-free journey, showing statistics, savings, and health benefits.',
    faqQuestion2: 'How do I set my quit date?',
    faqAnswer2: 'Click "Update Data" on the dashboard and enter the date you quit vaping.',
    faqQuestion3: 'Can I change my profile?',
    faqAnswer3: 'Yes, you can update any information by clicking "Update Data".',
  },
  fr: {
    dashboard: 'Tableau de bord',
    cravings: 'Envies',
    game: 'Jeu',
    about: 'À propos',
    support: 'Support',
    darkMode: 'Mode sombre',
    lightMode: 'Mode clair',
    logout: 'Déconnexion',
    language: 'Langue',
    updateData: 'Mettre à jour les données',
    welcome: 'Bienvenue dans QuitVape!',
    needInfo: 'Nous avons besoin de quelques informations pour commencer à suivre votre progression.',
    startNow: 'Commencer maintenant',
    supportTitle: 'Service client',
    supportDesc: 'Comment pouvons-nous vous aider?',
    faq: 'Questions fréquemment posées',
    contact: 'Nous contacter',
    email: 'E-mail',
    phone: 'Téléphone',
    hours: 'Horaires d\'ouverture',
    businessHours: 'Lundi au vendredi, 9h-18h',
    faqQuestion1: 'Comment fonctionne l\'application?',
    faqAnswer1: 'QuitVape vous aide à suivre votre progression dans votre parcours sans vape, en affichant les statistiques, les économies et les avantages pour la santé.',
    faqQuestion2: 'Comment définir ma date d\'arrêt?',
    faqAnswer2: 'Cliquez sur "Mettre à jour les données" dans le tableau de bord et entrez la date à laquelle vous avez arrêté de vapoter.',
    faqQuestion3: 'Puis-je modifier mon profil?',
    faqAnswer3: 'Oui, vous pouvez mettre à jour toute information en cliquant sur "Mettre à jour les données".',
  }
};

export function getLanguage() {
  return localStorage.getItem('appLanguage') || 'pt';
}

export function setLanguage(lang) {
  localStorage.setItem('appLanguage', lang);
}

export function t(key) {
  const lang = getLanguage();
  return translations[lang]?.[key] || translations['pt'][key] || key;
}

export function getAllLanguages() {
  return ['pt', 'en', 'fr'];
}

export function getLanguageName(lang) {
  const names = { pt: 'Português', en: 'English', fr: 'French' };
  return names[lang] || lang;
}
