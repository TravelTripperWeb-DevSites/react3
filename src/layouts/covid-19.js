import React from 'react'
import { useRouteData, Head, useSiteData } from 'react-static'

import { useSiteTranslator, parsePage } from 'pegs-web';

import i18next from 'i18next'

import DefaultLayout from './default';



// very similar to Post.js component
export default function Covid19Layout() {
  // get the post data
  const page = useRouteData();
  const t = useSiteTranslator(page.currentLocale);
  console.log(parsePage)

  return (
    <DefaultLayout>
      <Head>
        <title>Override: {page.data.title}</title>
      </Head>
      {parsePage(page)}
    </DefaultLayout>
  )
}