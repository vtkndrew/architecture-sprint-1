import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Switch, Route, useHistory } from 'react-router-dom'

import './index.css'
import { eventBus } from './shared/eventBus'
import Main from './components/Main'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Footer from './components/Footer'
import Register from './components/Register'
import Login from './components/Login'
import * as auth from './utils/auth'
import InfoTooltip from './components/InfoTooltip'

const App = () => {
  useEffect(() => {
    const closeAllPopupsCb = () => {
      closeAllPopups()
    }

    eventBus.subscribe('closeAllPopups', closeAllPopupsCb)
    return () => {
      eventBus.unsubscribe('closeAllPopups', closeAllPopupsCb)
    }
  }, [])

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')

  const [isInfoToolTipOpen, setIsInfoToolTipOpen] = useState(false)
  const [tooltipStatus, setTooltipStatus] = useState('')

  const history = useHistory()

  useEffect(() => {
    const token = localStorage.getItem('jwt')

    if (token) {
      auth
        .checkToken(token)
        .then(res => {
          setEmail(res.data.email)
          setIsLoggedIn(true)
          history.push('/')
        })
        .catch(err => {
          localStorage.removeItem('jwt')
          console.log(err)
        })
    }
  }, [history])

  function onRegister({ email, password }) {
    auth
      .register(email, password)
      .then(res => {
        setTooltipStatus('success')
        setIsInfoToolTipOpen(true)
        history.push('/signin')
      })
      .catch(err => {
        setTooltipStatus('fail')
        setIsInfoToolTipOpen(true)
      })
  }

  function onLogin({ email, password }) {
    auth
      .login(email, password)
      .then(res => {
        setIsLoggedIn(true)
        setEmail(email)
        history.push('/')
      })
      .catch(err => {
        setTooltipStatus('fail')
        setIsInfoToolTipOpen(true)
      })
  }

  function onSignOut() {
    // при вызове обработчика onSignOut происходит удаление jwt
    localStorage.removeItem('jwt')
    setIsLoggedIn(false)
    // После успешного вызова обработчика onSignOut происходит редирект на /signin
    history.push('/signin')
  }

  function closeAllPopups() {
    setIsInfoToolTipOpen(false)
  }

  return (
    <div className="page__content">
      <Header email={email} onSignOut={onSignOut} />
      <Switch>
        <ProtectedRoute
          exact
          path="/"
          component={Main}
          eventBus={eventBus}
          loggedIn={isLoggedIn}
        />
        <Route path="/signup">
          <Register onRegister={onRegister} />
        </Route>
        <Route path="/signin">
          <Login onLogin={onLogin} />
        </Route>
      </Switch>
      <Footer />
      <InfoTooltip
        isOpen={isInfoToolTipOpen}
        onClose={() => {
          eventBus.publish('closeAllPopups')
        }}
        status={tooltipStatus}
      />
    </div>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
