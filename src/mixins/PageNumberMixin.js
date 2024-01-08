import { useLocation } from 'react-router-dom';

const usePageNumber = () => {
  const location = useLocation();
  const getPageNumber = (page) => {
    if (typeof page === 'undefined') {
      page = new URLSearchParams(location.search).get('page');
    }
    return (page && /^\d+$/.test(page) ? Math.max(1, Number(page)) : 1);
  };

  return getPageNumber;
};

export default usePageNumber;