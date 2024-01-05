const { useState } = require("react");

export default function useStorage() {
  const get = (key, defaultValue) => {
    const value = window.localStorage[key];
    return typeof value !== "undefined" ? value : defaultValue;
  };

  const set = (key, value) => {
    window.localStorage[key] = value;
  };

  return { get, set };
}