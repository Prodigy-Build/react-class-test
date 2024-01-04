import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { useScroll } from 'react-router-scroll';

import './style.css';
import 'setimmediate';

import App from './App';

const history = createBrowserHistory();

ReactDOM.render(
  <Router history={history} scroll={useScroll()}>
    <App />
  </Router>,
  document.getElementById('app')
);