import React from 'react'
import { useRouteData } from 'react-static'

// very similar to Post.js component
export default function DataPage() {
  // get the post data
  const post = useRouteData();
  console.log(post);
  return (
    <div>
      <h3>{post.title}</h3>
      <div>{post.content}</div>
    </div>
  )
}