import React, { Component, Suspense } from 'react'

import { Root, Routes } from 'react-static'
import { Router, Link } from '@reach/router'

import './css/main.scss'

import './app.css'
import logo from './logo.png'

import DataHandler from './DataHandler.js';



class App extends Component {
  render() {
    return (      
      <Root className="App">
         <Suspense fallback='...LOADING...'> 
           <Router>
             <Routes default/>
           </Router>
         </Suspense>
      </Root>
    )
  }
}

export default App
