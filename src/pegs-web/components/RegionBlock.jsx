import React from 'react';
import nodePath from 'path'

import { parseHtml } from '../pageParser';

const renderRegionItem = (page, regionType, regionName, regionItem) => {
  if (regionType == 'text' || regionType == 'html' || regionType == 'header') {
    return parseHtml(regionItem.content, page)
  }
}


const RegionBlock = ({
  page,
  getDefaultChildren,
  children,
  regionName,
  regionType,
  regionClasses
}) => {
  const fileName = `${regionName}.json`
  const regionPath = nodePath.join(page.currentLocale, page.filePath, fileName);
  
  const regionItems = page.regions[regionName]
  console.log(page)
  let childContent = null;
  if (regionItems) {
    childContent = [];
    for(let regionItem of regionItems) {
      childContent.push(renderRegionItem(page, regionType, regionName, regionItem))
    }
  } else {
    childContent = getDefaultChildren ? getDefaultChildren() : children;
  }
  
  return <div id={`tt-region-${regionName}`} 
            className='tt-region' 
            data-region={regionPath}
            data-region-type={regionType}
            data-region-classes={regionClasses}
  >
    {childContent}
  </div>
}

export default RegionBlock;