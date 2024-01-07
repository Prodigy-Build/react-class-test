import React from 'react';

function pluralise(howMany, suffixes) {
  return (suffixes || ',s').split(',')[(howMany === 1 ? 0 : 1)]
}

export default function Pluralise() {
  const howMany = 1;
  const suffixes = ',s';

  return pluralise(howMany, suffixes);
}