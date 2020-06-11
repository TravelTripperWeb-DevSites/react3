import React from 'react'
import { Head } from 'react-static'
import { getLayoutContents, RegionBlock } from 'pegs-web';

import {BlogExcerpt, BlogAside} from 'components';
import DefaultLayout from './default';


// very similar to Post.js component
export default function BlogListLayout({children}) {
  // get the post data
  
  const {page, contents, t, T} = getLayoutContents(children);
  
  let posts = []
  page.data.forEach((blog, index) => {
    posts.push(<BlogExcerpt key={`blog-post-${index}`} blog={blog} />)
  })
  
  const pageContext = {
    currentLocale: 'en',
    filePath: 'blog',
    regions: []
  }
  
  console.log(page, contents)
  
  return (<DefaultLayout>
<section  data-spy="scroll" data-target=".scrollspy">
  <div className="container no-padding">
    <div className="page-banner blog-banner">
      <div>
        <RegionBlock regionName="blog_header" type="header" page={pageContext}>
          <h1 className="page-title" tabindex="0">Blog</h1>
        </RegionBlock>

        <div tabindex="0">
          <RegionBlock regionName="blog_intro" type="text" page={pageContext}>
          <p>The island of Key West packs a lot of punch in its relatively small surface area. To keep tabs on Duval Street nightlife, seasonal seafood, event guides, watersport adventures and more, bookmark the 24 North Hotel Blog.</p>
          </RegionBlock>
        </div>
      </div>

      <div className="graphic">
        <img src="/images/floating/stamp-1.png" alt="24 north stamp" />
      </div>

    </div>
  </div>
  <section className="blog-section">
    <div className="container">
      <div className="row">
        <div className="col-sm-4 ">
          <div className="blog-right-block ">
            <BlogAside />
          </div>
        </div>
        <div className="col-sm-8">
          <div className="blog-list">
            {posts}
          </div>
          <div className="pagination-wrapper">
            <div className="pagination">
              <p><span className="page_number ">Page: { page.pageIndex } of { page.totalPages }</span></p>
              <ul className="pagination">

                { (page.pageIndex > 0) ?
                  <li><a href="#" className="button-common btn-blue"><i className="fa fa-caret-left" aria-hidden="true"></i> Previous</a></li> 
                  : 
                  ''
                }
                
                { (page.pageIndex < page.totalPages) ?
                    <li><a href="#" className="button-common btn-blue">Next <i className="fa fa-caret-right" aria-hidden="true"></i></a></li>
                  :
                  ''
                }
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</section></DefaultLayout>
  )
}