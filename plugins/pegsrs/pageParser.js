import React from 'react';
import nodePath from 'path'
import { Head } from 'react-static'

import RegionBlock from './components/RegionBlock';

import ReactHtmlParser, { processNodes, convertNodeToElement, htmlparser2 } from 'react-html-parser';

import { useSiteTranslator } from './siteTranslator';

import * as customComponents from '../../src/components/';


const customComponentNames = Object.keys(customComponents).reduce((map, key) => {
  map[key.toString().toLowerCase()] = customComponents[key]
  return map;
}, {})



export function getCustomComponent(tagName) {
  return customComponentNames[tagName.toString().toLowerCase()]
}


export function transformNode(page, node, index) {
  if (node.type === 'tag') {
    if (node.name === 'head') {
      return <Head>{node.children.map((n, index)=>transformNode(page, n, index))}</Head>    
    } else if (node.name === 't') {
      // Expect a single text child node
      const tKey = node.children[0]
      if (tKey && tKey.type == 'text') {
        const locale = node.attribs.locale || page.currentLocale
        const t = useSiteTranslator(locale);
        return <span>{t(tKey.data)}</span>
      }
    } else if (node.name === 'regionblock') {
      const regionName = node.attribs['name']
      const regionType = node.attribs['type']
      const regionClasses = node.attribs['classes']
      
      const getDefaultChildren = () => node.children.map((n, index)=>transformNode(page, n, index))
      
      return <RegionBlock 
        key={regionName}
        page={page}
        getDefaultChildren={getDefaultChildren} 
        regionName={regionName} 
        regionType={regionType} 
        regionClasses={regionClasses} />
      
    } else {
      let customComponent = getCustomComponent(node.name)
      if (customComponent) {
        let children = node.children.map((n, index)=>transformNode(page, n, index))
        return React.createElement(customComponent, {page: page, node: node}, children);
      }
    }
  }
  return convertNodeToElement(node, index, (node, index) => transformNode(page, node, index));
  
}

export function parseHtml(html, page) {
  return ReactHtmlParser(html, {transform: (node, index) => transformNode(page, node, index)})
}

export function parsePage(page) {
  return parseHtml(page.content, page)
}