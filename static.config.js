// This file is used to configure:
// - static-site generation
// - Document shell (index.html)
// - ...tons of other things!

// Get started at https://react-static.js.org

import path from 'path';
import axios from 'axios';
import glob from 'glob-promise';
import fs from 'fs-extra';

import { rebuildRoutes } from 'react-static/node';

import chokidar from 'chokidar'
//
let areRoutesBuilt = false;
chokidar.watch('./_data').on('all', () => areRoutesBuilt  && rebuildRoutes())
//chokidar.watch('./_pages').on('all', () => areRoutesBuilt  && rebuildRoutes())


export default {
  maxThreads: 1, // Remove this when you start doing any static generation
  devServer: {
  //   host: process.env.CONTAINER_IP || "http://localhost:3000/",
  //   port: 3000
  },
  getSiteData: async (opts) => {
    const resources = await opts.loadResources();
    return {
      locales: ['en', 'es'],
      defaultLocale: 'en',
      i18nResources: resources
    }
  },  
  getRoutes: async (opts) => {    
    let files = await glob("./_data/**/*.json")
    let models = [] //[mypost]
    for(let file of files) {
      let data = JSON.parse(await fs.readFile(file))
      data['filename'] = file
      models.push(data)
    }
    
    let modelPages = models.map((model) => {
      return {
        path: model.permalink,
        getData: () => model,
        template: "src/containers/DataPage"
      }
    })
    
    areRoutesBuilt = true;
    return [
      {
        path: '/',
        template: "src/containers/DataPage.js",
        getData: () => {
          return {
            title: "Home",
            content: "Welcome!"
          }
        }
        
      },
      //...modelPages
    ]
    
  },
  plugins: [
    ["pegs-locale-loader"],
    ["pegs-page-loader"]
  ]
  
}
