import React from 'react';

const Spinner = ({ size = 6, spacing = 2 }) => {
  const bounceSize = size + 'px';
  const bounceStyle = { height: bounceSize, width: bounceSize, marginRight: spacing + 'px' };

  return (
    <div className="Spinner" style={{ width: ((Number(size) + Number(spacing)) * 3) + 'px' }}>
      <div className="bounce1" style={bounceStyle} />
      <div className="bounce2" style={bounceStyle} />
      <div className="bounce3" style={bounceStyle} />
    </div>
  );
};

export default Spinner;