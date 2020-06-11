import React from 'react';
import { useSiteData } from 'react-static';
import Link from './Link';

import LocalizableData from '../../../plugins/pegs-page-loader/LocalizableData';


// Transform labels and urls to current page locale
const applyMenuToPage = (menu, page, defaultLocale) => {
  let newMenu = {...menu}
  newMenu.items = [];
  for(let item of menu.items) {
    newMenu.items.push(LocalizableData.localize(item, page.currentLocale, defaultLocale)) 
  }
  return newMenu
}

const MenuItem = ({item, page}) => {
  
  const isLink = !!item.url;
  let itemClass = 'nav-item';
  if (isLink) {
    // Is the url the same
    if (item.url == page.permalink) {
      itemClass += ' nav-item--selected '
    }
  } else {
    //TODO: Does the current URL include any child items?
  }
  
  let itemName = isLink ? <Link to={item.url} >{item.label}</Link> : <span>{item.label}</span>

  const hasSubItems = !!item.items;
  let subMenu = null
  if (hasSubItems) {
    console.log(item);
    let subItems = [];
    item.items.forEach((subItem, index) => {
      subItems.push(<MenuItem item={subItem} page={page} key={subItem.url || `menu-item-${index+1}`}/>)
    })
    subMenu = <ul>{subItems}</ul>
  }

  return <li className={itemClass}>
    {itemName}
    {subMenu}
  </li>
}


const MenuNav = ({
  menuId = 'main',
  page
}) => {
  
  const siteData = useSiteData();
  const menu = applyMenuToPage(siteData.menus[menuId], page, siteData.defaultLocale)
  let menuItems = [];
  
  menu.items.forEach((item, index) => {
    menuItems.push(<MenuItem item={item} page={page} key={item.url || `menu-item-${index+1}`}/>)
  })
  
  return <nav>
    <ul>{menuItems}</ul>
  </nav>
}

export default MenuNav;