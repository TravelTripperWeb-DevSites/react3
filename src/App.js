import React, { Component, Suspense } from 'react'

import { Root, Routes } from 'react-static'
import { Router, Link } from '@reach/router'

import './app.css'
import logo from './logo.png'

import DataHandler from './DataHandler.js';

const NotFound = () => <p>Sorry, nothing here</p>

class App extends Component {
  render() {
    return (
      <Root className="App">
          <Suspense fallback="loading">
            <Router>
              <Routes default/>
            </Router>
          </Suspense>
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <span>
            Learn{' '}
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              React
            </a>{' '}
            and{' '}
            <a
              className="App-link"
              href="https://react-static.js.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              React Static
            </a>
          </span>
        </header>
      </Root>
    )
  }
}

export default App
