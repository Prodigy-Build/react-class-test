module.exports = {
  type: 'react-app',
  webpack: {
    define: {
      __VERSION__: JSON.stringify(require('./package.json').version)
    },
    // Path-independent build which doesn't have to be served at /
    publicPath: ''
  }
}
/* --------------------------------------
	The code does not contain any react classes or hooks.
  The code only includes webpack configuration which does not involve react.
  Therefore, there is no need to convert anything to be functional with react hooks.
---------------------------------------- */