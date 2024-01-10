import React, { useState, useEffect } from 'react';

function cancellableDebounce(func, wait, immediate) {
  const [timeout, setTimeout] = useState(null);
  const [args, setArgs] = useState(null);
  const [context, setContext] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [result, setResult] = useState(null);

  const later = () => {
    const last = Date.now() - timestamp;
    if (last < wait && last > 0) {
      setTimeout(setTimeout, wait - last);
    } else {
      setTimeout(null);
      if (!immediate) {
        setResult(func.apply(context, args));
        if (!timeout) {
          setContext(null);
          setArgs(null);
        }
      }
    }
  };

  const debounced = () => {
    setContext(this);
    setArgs(arguments);
    setTimestamp(Date.now());
    const callNow = immediate && !timeout;
    if (!timeout) {
      setTimeout(later, wait);
    }
    if (callNow) {
      setResult(func.apply(context, args));
      setContext(null);
      setArgs(null);
    }
    return result;
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
  };

  return debounced;
}

export default cancellableDebounce;