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
//chokidar.watch('./public/_data').on('all', () => areRoutesBuilt  && rebuildRoutes())
//chokidar.watch('./_pages').on('all', () => areRoutesBuilt  && rebuildRoutes())


export default {
  locales: ['en', 'es'],
  defaultLocale: 'en',
  maxThreads: 1, // Remove this when you start doing any static generation
  devServer: {
  //   host: process.env.CONTAINER_IP || "http://localhost:3000/",
  //   port: 3000
  },
  getSiteData: async (state) => {
    const {resources, pages, settings, modelDefinitions, menus} = await state.prepareData();
    //const models = await opts.loadModels();
    return {
      locales: ['en', 'es'],
      defaultLocale: 'en',
      i18nResources: resources,
      settings,
      menus
      //regionConfig
      //modelDefinitions // Only include this if really needed to live-parse definisions
      //models
    }
  },  
  getRoutes: async (opts) => {    
    let files = await glob("./public/_data/**/*.json")
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
      //...modelPages
    ]
    
  },
  plugins: [
    ["pegs-locale-loader"],
    ["pegs-model-loader"],
    ["pegs-page-loader"]
  ]
  
}
