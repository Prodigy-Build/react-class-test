import React, { useEffect, useRef } from "react";

function cancellableDebounce(func, wait, immediate) {
  const timeoutRef = useRef(null);
  const argsRef = useRef(null);
  const contextRef = useRef(null);
  const timestampRef = useRef(null);
  const resultRef = useRef(null);

  const later = () => {
    const last = Date.now() - timestampRef.current;
    if (last < wait && last > 0) {
      timeoutRef.current = setTimeout(later, wait - last);
    } else {
      timeoutRef.current = null;
      if (!immediate) {
        resultRef.current = func.apply(contextRef.current, argsRef.current);
        if (!timeoutRef.current) {
          contextRef.current = null;
          argsRef.current = null;
        }
      }
    }
  };

  const debounced = () => {
    contextRef.current = this;
    argsRef.current = arguments;
    timestampRef.current = Date.now();
    const callNow = immediate && !timeoutRef.current;
    if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(later, wait);
    }
    if (callNow) {
      resultRef.current = func.apply(contextRef.current, argsRef.current);
      contextRef.current = null;
      argsRef.current = null;
    }
    return resultRef.current;
  };

  debounced.cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return debounced;
}

export default cancellableDebounce;