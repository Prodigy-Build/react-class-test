import React from 'react';

const usePageNumber = (page, location) => {
  if (typeof page === 'undefined') {
    page = location.query.page;
  }
  return page && /^\d+$/.test(page) ? Math.max(1, Number(page)) : 1;
};

export default usePageNumber;