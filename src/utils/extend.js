import React from 'react';

const extend = (dest, src1, src2) => {
  const props = Object.keys(src1);
  for (let i = 0, l = props.length; i < l; i++) {
    dest[props[i]] = src1[props[i]];
  }
  if (src2) {
    const props2 = Object.keys(src2);
    for (let i = 0, l = props2.length; i < l; i++) {
      dest[props2[i]] = src2[props2[i]];
    }
  }
  return dest;
};

export default extend;