import React from 'react';

import { useRouteData } from 'react-static'

import { useSiteTranslator, parsePage } from './index';

//Component
const T = ({children}) => {
  const page = useRouteData();
  const t = useSiteTranslator(page.currentLocale);
  return <React.Fragment> {t(children)} </React.Fragment>
}

//Hook
export const getLayoutContents = (children) => {
  const page = useRouteData();
  const contents = children || parsePage(page)
  const t = useSiteTranslator(page.currentLocale);
  return {
    page,
    contents,
    t,
    T
  }
}