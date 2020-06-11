import React from 'react'
import { parseHtml, Link } from '../pegs-web';


const BlogExcerpt = (props) => {
  const post = props.blog;
  console.log(post)
  
  const url = post.permalink
  const d = post.date; //{% assign d = post.date | date: "%-d" %} {{ post.date | date: "%B" }}
  //{% case d %}{% when "1" or "21" or "31" %}{{ d }}st{% when "2" or "22" %}{{ d }}nd{% when "3" or "23" %}{{ d }}rd{% else %}{{ d }}th{% endcase %}
  //  , {{ post.date | date: "%Y" }}
  return <div className="blog-item">
            <div className="post-image-holder">
              <Link to={url}>
                <img src={ post.blogimage.url } alt={ post.title } tabIndex="-1"/>
              </Link>
              { post.Image_caption }
            </div>

            <h2 className="h2"><Link to={url}>{ post.title }</Link></h2>

            <div className="post-details">
              <span className="date" tabIndex="0"> Posted on: {d}
               </span> | <span className="category" aria-label={`${post.category.title} Category`}><a href={`/blog/category/${post.category.url_friendly_name}`}>{post.category.title}</a></span>
            </div>
            { post.short_description ?
              <div tabIndex="0">
                { parseHtml(post.short_description) }
              </div>
              :
              ''
            }
            <div className="blog-btn">
              <a href={url} className="button-common btn-blue">Read More<i className="fa fa-play"></i></a>
            </div>
          </div>
}

export default BlogExcerpt;