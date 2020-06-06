import React from 'react'
import { useRouteData, Head, useSiteData } from 'react-static'

import { useSiteTranslator } from 'siteTranslator';

import i18next from 'i18next'
import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';


function transform(node, index) {
  if (node.type === 'tag' && node.name === 'head') {
    return <Head>{node.children.map((n)=>transform(n))}</Head>
    
  } else {
    return convertNodeToElement(node, index, transform);
  }
}


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
      {ReactHtmlParser(page.content, {transform: transform})}
      {JSON.stringify(page.data)}
    </div>
  )
}