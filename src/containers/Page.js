import React from 'react'
import { useRouteData, Head, useSiteData } from 'react-static'

import { useSiteTranslator, parsePage } from 'pegsrs/node';

import i18next from 'i18next'





// very similar to Post.js component
export default function Page() {
  // get the post data
  const page = useRouteData();
  const t = useSiteTranslator(page.currentLocale);
  
  return (
    <div>
      <Head>
        <title>{page.data.title}</title>
      </Head>

      <p>{t('hello')}</p>
      {parsePage(page)}
      {JSON.stringify(page.data)}
    </div>
  )
}