import React, { useEffect, useState } from 'react';

function cancellableDebounce(func, wait, immediate) {
  const [timeout, setTimeout] = useState(null);
  const [args, setArguments] = useState([]);
  const [context, setContext] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
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
            setArguments(null);
          }
        }
      }
    };

    const debounced = () => {
      setContext(this);
      setArguments(arguments);
      setTimestamp(Date.now());
      const callNow = immediate && !timeout;
      if (!timeout) {
        setTimeout(later, wait);
      }
      if (callNow) {
        setResult(func.apply(context, args));
        setContext(null);
        setArguments(null);
      }
      return result;
    };

    debounced.cancel = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  return debounced;
}

export default cancellableDebounce;