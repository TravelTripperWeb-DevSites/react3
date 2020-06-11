import React from 'react';

const TBDComponent = (props) => {
  console.log(this, props)
  let { node } = props;
  node = node || {}
  return <span>&lt;{node.name}&gt; Needs Implementation</span>
}

export default TBDComponent;