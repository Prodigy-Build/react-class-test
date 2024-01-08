import {hashHistory} from 'react-router'
import React from 'react'
import {render} from 'react-dom'
import {Router} from 'react-router'
import {useScroll} from 'react-router-scroll'
import {applyRouterMiddleware} from 'react-router/lib/applyRouterMiddleware'

import './style.css'
import 'setimmediate'

import routes from './routes'

const App = () => (
  <Router
    history={hashHistory}
    render={applyRouterMiddleware(useScroll())}
    routes={routes}
  />
)

render(<App />, document.getElementById('app'))