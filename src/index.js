import React from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { useScroll } from 'react-router-scroll';

import './style.css';
import 'setimmediate';

import routes from './routes';

const history = createBrowserHistory();

const App = () => (
  <Router history={history} scroll={useScroll()}>
    {routes}
  </Router>
);

render(<App />, document.getElementById('app'));