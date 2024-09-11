import React from 'react';
import { Link } from 'react-router-dom';

const Paginator = ({ page, hasNext, route }) => {
  const _onClick = () => {
    setTimeout(() => { window.scrollTo(0, 0) }, 0);
  };

  if (page === 1 && !hasNext) {
    return null;
  }

  return (
    <div className="Paginator">
      {page > 1 && (
        <span className="Paginator__prev">
          <Link to={{ pathname: `/${route}`, query: { page: page - 1 } }} onClick={_onClick}>Prev</Link>
        </span>
      )}
      {page > 1 && hasNext && ' | '}
      {hasNext && (
        <span className="Paginator__next">
          <Link to={{ pathname: `/${route}`, query: { page: page + 1 } }} onClick={_onClick}>More</Link>
        </span>
      )}
    </div>
  );
};

export default Paginator;