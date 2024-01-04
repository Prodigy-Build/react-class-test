function pluralise(howMany, suffixes) {
  return (suffixes || ',s').split(',')[+(howMany !== 1)];
}

export default pluralise;