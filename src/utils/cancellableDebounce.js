import React, { useEffect, useRef } from 'react';

const useCancellableDebounce = (func, wait, immediate) => {
  const timeoutRef = useRef();

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const debounced = (...args) => {
    clearTimeout(timeoutRef.current);

    if (immediate && !timeoutRef.current) {
      func.apply(this, args);
    }

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      if (!immediate) {
        func.apply(this, args);
      }
    }, wait);
  };

  debounced.cancel = () => {
    clearTimeout(timeoutRef.current);
  };

  return debounced;
};

export default useCancellableDebounce;