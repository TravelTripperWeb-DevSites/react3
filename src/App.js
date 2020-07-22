import React, { Component, Suspense } from 'react'

import { Root, Routes } from 'react-static'
import { Router, Link } from '@reach/router'

import './css/main.scss'

import './app.css'
import logo from './logo.png'

import DataHandler from './DataHandler.js';



class App extends Component {
  render() {
    //console.log(output)
    return (      
      <Root className="App">
          <Suspense fallback={()=>{console.log("FALLBACK"); return '...LOADING...';}}> 
            <Router>
              <Routes default/>
            </Router>
          </Suspense>
      </Root>
    )
  }
}

export default App
