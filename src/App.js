import React, { Component, Suspense } from 'react'

import { Root, Routes } from 'react-static'
import { Router, Link } from '@reach/router'

import './app.css'
import logo from './logo.png'

import DataHandler from './DataHandler.js';



class App extends Component {
  render() {
    //console.log(output)
    return (      
      <Root className="App">
          <Suspense fallback="..loading.."> 
            <Router>
              <Routes default/>
            </Router>
          </Suspense>
      </Root>
    )
  }
}

export default App
