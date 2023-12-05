import {useHistory} from 'react-router-dom'
import {useEffect} from 'react'
import './style.css'
import setImmediate from 'setimmediate'
import React from 'react'
import {render} from 'react-dom'
import {Router} from 'react-router-dom'
import {useScroll} from 'react-router-scroll'

import routes from './routes'

const App = () => {
  const history = useHistory()

  useEffect(() => {
    render(
      <Router history={history} render={applyRouterMiddleware(useScroll())} routes={routes} />,
      document.getElementById('app')
    )
  }, [])

  return null
}

export default App