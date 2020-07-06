import { useSiteData } from 'react-static'
import i18next from 'i18next'



export function useSiteTranslator(locale) {
  const sd = useSiteData();
  const resources = sd.i18nResources;
  i18next.init({
    lng: 'en',
    debug: true,
    resources: resources
  });
  const t = i18next.getFixedT(locale)
  return t;
}