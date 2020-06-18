import React from 'react';

export const makeTBDComponent = (nodeName) => {
  return (props) => {
    return <TBDComponent node= { {name: nodeName} } />
  }
}

const TBDComponent = (props) => {
  let { node } = props;
  node = node || {}
  console.debug(`${node.name} needs implementation`)
  return <span>&lt;{node.name}&gt; Needs Implementation</span>
}

export default TBDComponent;