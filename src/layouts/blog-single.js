import React from 'react'
import nodePath from 'path'
import { Head, useSiteData } from 'react-static'
import { parseHtml, getLayoutContents, useModelInstance, RegionBlock, Link } from 'pegs-web';


import {BlogExcerpt, BlogAside, SocialShare, FacebookComments} from 'components';
import DefaultLayout from './default';




// very similar to Post.js component
export default function BlogSingleLayout({children}) {
  const {page, contents, t, T} = getLayoutContents(children);
  const siteData = useSiteData();
  console.log(siteData);
  const blog = page.data;
  
  const [category, setCategory] = useModelInstance(page, 'category', blog.category)
  
  console.log(page)
  
  const urlPrefix = page.currentLocale == siteData.defaultLocale ? '/' : `/${page.currentLocale}`
  const blogsUrl = nodePath.join(urlPrefix, 'blog')
 
  //TODO: process content to include navive ad component 
  // <!-- Append Native Ads into Blog content -->
 //  {% assign content = blog.more_content | split: '</p>' %}
 //  {% assign halfpost = content.size | divided_by: 2 %}
 //  {% for part in content %}
 //    {% if part != ''%}
 //     <p>{{ part | replace: '<p>', ''}}</p>
 //    {% endif %}
 //    {% if forloop.index == halfpost %}
 //      {% include native-ad.html %}
 //    {% endif %}
 //  {% endfor %}
 //
  
  
 // TODO: get prev/next posts?
// <div className="pagination blog-detail-pagination">
//   {% if prevPostUrl %}
//     <a className="button-common btn-blue" href="/blog/{{prevPostUrl}}/" title="Prev Blog">
//       <i className="fa fa-caret-left" aria-hidden="true"></i>
//       Previous </a>
//   {% else %}
//     <a className="button-common btn-blue not-active" href="/blog/" title="Current Blog">
//       <i className="fa fa-caret-left" aria-hidden="true"></i>
//       Previous </a>
//   {% endif %}
//   {% if nextPostUrl %}
//     <a className="button-common btn-blue" href="/blog/{{nextPostUrl}}/" title="Next Blog">Next
//       <i className="fa fa-caret-right" aria-hidden="true"></i></i>
//     </a>
//   {% else %}
//     <a className="button-common btn-blue not-active" href="/blog/{{nextPostUrl}}/" title="Next Blog">Next
//       <i className="fa fa-caret-right" aria-hidden="true"></i></i>
//     </a>
//   {% endif %}
// </div>
// <hr>
  
  return <DefaultLayout>
<section>
  <div className="container no-padding">
    <div className="page-banner blog-banner" style={{backgroundImage: `url('${ blog.blogimage.url }')`}}>
      <div className="graphic"><img src="/images/floating/stamp-1.png" alt="24 north stamp" /></div>
      <h1 className="h2 page-title" tabIndex="0">{ blog.title }}</h1>     
    </div>
  </div>
</section>

<section className="blog-section">
  <div className="container">
    <div className="row">
      <div className="col-sm-4 scrollspy">
        <div className="blog-right-block fixed-sidebar">
          <BlogAside/>
        </div>
      </div>
      <div className="col-sm-8">
        <div className="blog-list blog-detail">
          <div className="col-md-12 no-padding">
            <div className="blog-item">
              <div className="post-details">
                <span className="date"> Posted on: {blog.date}</span> |
                  { category ?
                    <span className="category">
                      <Link to={`/blog/category/${ category.url_friendly_name }`} title={category.title}>{ category.title }</Link>
                    </span>
                    :
                    ''
                  }
              </div>
              <div className="post-image-holder"><img src={ blog.blogimage.url } alt={ blog.title } title={ blog.title } className="hero-img" />
              { blog.Image_caption }
              </div>
              <div className="blog-description" tabIndex="0">
                {parseHtml(blog.more_content)}
              </div>

              <hr />
              <SocialShare />
              <hr />
              <div className="pagination blog-detail-pagination">
                { blog.previousBlog ?
                  <a className="button-common btn-blue" href={blog.previousBlog.permalink} title="Prev Blog">
                    <i className="fa fa-caret-left" aria-hidden="true"></i>
                    Previous: {blog.previousBlog.title} </a>
                  :
                  ''
                }
                { blog.nextBlog ?
                  <a className="button-common btn-blue" href={blog.nextBlog.permalink} title="Next Blog">Next: {blog.nextBlog.title}
                    <i className="fa fa-caret-right" aria-hidden="true"></i>
                  </a>
                  :
                  ''
                }
              </div>
              <hr/>
              <div><Link to={blogsUrl} className="button-common btn-blue" title="See all Blog Posts">See all Blog Posts<i className="fa fa-play"></i></Link></div>
            </div>
            <hr />
            <h2>Share your opinion on this article</h2>
            <FacebookComments />
          </div>
        </div>
      </div>

    </div>
  </div>
</section>
  </DefaultLayout>
}