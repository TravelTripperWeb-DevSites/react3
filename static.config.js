// This file is used to configure:
// - static-site generation
// - Document shell (index.html)
// - ...tons of other things!

// Get started at https://react-static.js.org

import path from 'path';
import axios from 'axios';
import glob from 'glob-promise';
import fs from 'fs-extra';

import { rebuildRoutes, makePageRoutes } from 'react-static/node';

import chokidar from 'chokidar'
//
let areRoutesBuilt = false;
//chokidar.watch('./public/_data').on('all', () => areRoutesBuilt  && rebuildRoutes())
//chokidar.watch('./_pages').on('all', () => areRoutesBuilt  && rebuildRoutes())

const makeModelRoutes = (state, modelName, items, pageGenerationOpts = null , paginationOpts = null) => {
  let routes = []
  let locale = 'en'
  
  if (pageGenerationOpts) {
    const {
      rootPath,
      itemTemplate
    } = pageGenerationOpts;
    
    let modelUrlMethod = pageGenerationOpts.slugField || "url_friendly_name"
    
    routes = [...routes, ...items.map((item) => {
      const itemPath = path.join('/', rootPath, item[modelUrlMethod])
      item.permalink = itemPath
      // Convert this "post" into a full page.
      const page = {
        currentLocale: locale,
        data: item
      }
      return {
        path: itemPath,
        template: itemTemplate,
        getData: () => (page),
      }
    })]
    
  }
  
  
  if (paginationOpts) {
    const {perPage,
           rootPath,
           pagePrefix,
           pageTemplate } = paginationOpts;
    
    
    // Do this for each locale!
    routes = [...routes, ...makePageRoutes({
      items: items,
      pageSize: perPage,
      pageToken: pagePrefix,
      route: {
        path: rootPath,
        template: pageTemplate
      },
      decorate: (items, pageIndex, totalPages) => {
        // need to generate a virtual "page" context
        const data = {
          //permalink: path,
          data: items,
          // models: page.modelsNeeded.reduce((list,k) => {
          //   list[k]=models[k].data;
          //   return list;
          // }, {}),
          
          //regions: page.regions,
          //content: page.content,
          //filePath: page.filePath,
          currentLocale: locale,
          pagination: {
            currentPage: pageIndex,
            totalPages: totalPages
          }
        }
        return {
          // For each page, supply the posts, page and totalPages
          getData: () => (data),
        }
      }
    })]
  }
  return routes;
}



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
  getRoutes: async (state) => {    
    // let files = await glob("./public/_data/**/*.json")
    // let models = [] //[mypost]
    // for(let file of files) {
    //   let data = JSON.parse(await fs.readFile(file))
    //   data['filename'] = file
    //   models.push(data)
    // }
    //
    // let modelPages = models.map((model) => {
    //   return {
    //     path: model.permalink,
    //     getData: () => model,
    //     template: "src/containers/DataPage"
    //   }
    // })
    let filteredBlogs = []
    const blogsMap = state.models["blog"]
    for (let blogId in blogsMap) {
      const blog = blogsMap[blogId].data;
      const date = new Date(blog.date) // this converts to local time
      const now = new Date();
      const filterDate = new Date();
      filterDate.setFullYear(filterDate.getFullYear() - 1)
      if (date < now && date >= filterDate) {
        filteredBlogs.push(blog);
      }
    }
    filteredBlogs.sort((a,b) => {
      const aDate = new Date(a.date)
      const bDate = new Date(b.date)
      if (aDate > bDate) return -1;
      if (bDate > aDate) return 1;
      return 0;
    }) 
    
    areRoutesBuilt = true;
    return [
      ...makeModelRoutes(state, "blog", filteredBlogs, {
        rootPath: '/blogs',     
        itemTemplate: 'src/layouts/blog-single'
      }, {
        perPage: 5,
        rootPath: '/blogs',
        pagePrefix: 'page',
        pageTemplate: 'src/layouts/blog-list'
      })
    ]
    
  },
  plugins: [
    ["pegs-locale-loader"],
    ["pegs-model-loader"],
    ["pegs-page-loader"]
  ]
  
}
