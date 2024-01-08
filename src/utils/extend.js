import React from 'react';

function extend(dest, src1, src2) {
  var props = Object.keys(src1)
  for (var i = 0, l = props.length; i < l; i++) {
    dest[props[i]] = src1[props[i]]
  }
  if (src2) {
    props = Object.keys(src2)
    for (i = 0, l = props.length; i < l; i++) {
      dest[props[i]] = src2[props[i]]
    }
  }
  return dest
}

export default function useExtend(dest, src1, src2) {
  const extendedDest = React.useRef(dest);

  React.useEffect(() => {
    var props = Object.keys(src1)
    for (var i = 0, l = props.length; i < l; i++) {
      extendedDest.current[props[i]] = src1[props[i]]
    }
    if (src2) {
      props = Object.keys(src2)
      for (i = 0, l = props.length; i < l; i++) {
        extendedDest.current[props[i]] = src2[props[i]]
      }
    }
  }, [src1, src2]);

  return extendedDest.current;
}