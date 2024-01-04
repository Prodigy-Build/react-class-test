import { useState } from 'react';

const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    const storedValue = window.localStorage.getItem(key);
    return storedValue !== null ? storedValue : defaultValue;
  });

  const updateValue = (newValue) => {
    setValue(newValue);
    window.localStorage.setItem(key, newValue);
  };

  return [value, updateValue];
};

export default useLocalStorage;