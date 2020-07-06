import React from 'react'
import { Head } from 'react-static'
import { Header, TopBanner, Footer } from 'components'
import { MenuNav, getLayoutContents } from '../../plugins/pegsrs';

// very similar to Post.js component
export default function DefaultLayout({children}) {
  // get the post data
  
  const {page, contents, t} = getLayoutContents(children);
  
  return (
    <div>
      <Head 
        htmlAttributes= {{
          test: "value",
          lang: page.currentLocale
        }}
        bodyAttributes= {{
          id: "top"
        }}>
        <title>{page.data.title}</title>
      </Head>
      <div id="fb-root"></div>
        
      <Header />
      <TopBanner />
      <MenuNav page={page} menu="main" />
      <div id="main">
        {contents}
      </div>
      <Footer />      
    </div>
  )
}