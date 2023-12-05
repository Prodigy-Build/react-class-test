import React from 'react';

export default function storage() {
  const get = (key, defaultValue) => {
    const value = window.localStorage.getItem(key);
    return typeof value !== 'undefined' ? value : defaultValue;
  };

  const set = (key, value) => {
    window.localStorage.setItem(key, value);
  };

  return {
    get,
    set
  };
}