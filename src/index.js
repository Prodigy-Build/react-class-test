import React from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router';
import { useHistory } from 'react-router-dom';

import './style.css';

import 'setimmediate';

import routes from './routes';

const App = () => {
  const history = useHistory();

  return (
    <Router
      history={history}
      routes={routes}
    />
  );
}

render(
  <App />,
  document.getElementById('app')
);