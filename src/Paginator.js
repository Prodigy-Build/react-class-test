import React from 'react';
import { Link } from 'react-router-dom';

const Paginator = (props) => {
  const _onClick = (e) => {
    setTimeout(function() { window.scrollTo(0, 0) }, 0)
  };

  if (props.page === 1 && !props.hasNext) { 
    return null; 
  }

  return (
    <div className="Paginator">
      {props.page > 1 && <span className="Paginator__prev">
        <Link to={{pathname: `/${props.route}`, query: {page: props.page - 1}}} onClick={_onClick}>Prev</Link>
      </span>}
      {props.page > 1 && props.hasNext && ' | '}
      {props.hasNext && <span className="Paginator__next">
        <Link to={{pathname: `/${props.route}`, query: {page: props.page + 1}}} onClick={_onClick}>More</Link>
      </span>}
    </div>
  );
}

export default Paginator;