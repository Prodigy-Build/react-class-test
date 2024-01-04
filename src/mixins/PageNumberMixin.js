import { useLocation } from 'react-router-dom';

const getPageNumber = (page) => {
  const location = useLocation();
  if (typeof page === 'undefined') {
    page = new URLSearchParams(location.search).get('page');
  }
  return (page && /^\d+$/.test(page) ? Math.max(1, Number(page)) : 1);
};

export default getPageNumber;