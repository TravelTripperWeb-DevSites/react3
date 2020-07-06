import React from 'react';
import * as reachRouter from '@reach/router';

/**
 * Link that also works for external URL's
 */
const isExternalUrl = (url) => {
  return /^https?:\/\//.test(url)
}

const Link = (props) => {
  
  return isExternalUrl(props.to) ?
      <a
        href={props.to}
        {...props}
      />
      :
      <reachRouter.Link {...props} />;
}

export default Link;