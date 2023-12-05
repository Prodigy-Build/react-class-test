const extend = (dest, src1, src2) => {
  let props = Object.keys(src1);
  for (let i = 0, l = props.length; i < l; i++) {
    dest[props[i]] = src1[props[i]];
  }
  if (src2) {
    props = Object.keys(src2);
    for (let i = 0, l = props.length; i < l; i++) {
      dest[props[i]] = src2[props[i]];
    }
  }
  return dest;
}

export default extend;