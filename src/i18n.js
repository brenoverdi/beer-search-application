import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    message: {
      hello: 'Welcome to Beer Search',
      search: 'Search for Beers',
      map: 'Breweries Map',
      festivals: 'Festivals'
    }
  },
  es: {
    message: {
      hello: 'Bienvenido a Beer Search',
      search: 'Buscar Cervezas',
      map: 'Mapa de Cervecerías',
      festivals: 'Festivales'
    }
  },
  pt: {
    message: {
      hello: 'Bem-vindo ao Beer Search',
      search: 'Buscar Cervejas',
      map: 'Mapa de Cervejarias',
      festivals: 'Festivais'
    }
  }
}

// Very basic IP-based detection using timezone as a rough proxy if API unavailable
const detectLocale = () => {
  const language = navigator.language || navigator.userLanguage;
  if (language.includes('es')) return 'es';
  if (language.includes('pt')) return 'pt';
  return 'en';
}

const i18n = createI18n({
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages,
})

export default i18n
