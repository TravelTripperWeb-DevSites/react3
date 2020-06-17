import React from 'react'
import { Head } from 'react-static'
import { Header, TopBanner } from 'components'
import { MenuNav, getLayoutContents } from 'pegs-web';

// very similar to Post.js component
export default function DefaultLayout({children}) {
  // get the post data
  
  const {page, contents, t} = getLayoutContents(children);
  
  return (
    <div>
      <Head>
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