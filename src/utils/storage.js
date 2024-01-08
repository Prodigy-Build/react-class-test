export default {
  get: (key, defaultValue) => {
    const value = window.localStorage.getItem(key);
    return value !== null ? value : defaultValue;
  },
  set: (key, value) => {
    window.localStorage.setItem(key, value);
  }
};