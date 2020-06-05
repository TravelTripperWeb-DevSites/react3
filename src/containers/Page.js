import React from 'react'
import { useRouteData } from 'react-static'

// very similar to Post.js component
export default function Page() {
  // get the post data
  const page = useRouteData();
  console.log(page);
  
  
  
  return (
    <div>
      <h1>Im a page!</h1>
      {page.content}
      {JSON.stringify(page.data)}
    </div>
  )
}