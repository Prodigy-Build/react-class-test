import React, { useEffect } from 'react';
import { SITE_TITLE } from './constants';

const setTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_TITLE}` : SITE_TITLE;
  }, [title]);
};

export default setTitle;