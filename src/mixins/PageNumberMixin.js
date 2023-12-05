import React, { useEffect } from 'react';

function getPageNumber(page, props) {
  if (typeof page === 'undefined') {
    page = props.location.query.page;
  }
  return page && /^\d+$/.test(page) ? Math.max(1, Number(page)) : 1;
}

function PageNumberMixin(props) {
  useEffect(() => {
    const page = getPageNumber(undefined, props);
    // Do something with the page number
  }, [props.location.query.page]);

  return null;
}

export default PageNumberMixin;