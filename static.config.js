// This file is used to configure:
// - static-site generation
// - Document shell (index.html)
// - ...tons of other things!

// Get started at https://react-static.js.org
import * as React from "react";
import Helmet from 'react-helmet'
import nodePath from 'path';
import axios from 'axios';
import glob from 'glob-promise';
import fs from 'fs-extra';

import Category from './src/modelClasses/category'
import { LocalizableData } from 'pegsrs/browser';

export default {
  locales: ['en', 'es'],
  defaultLocale: 'en',
  
  modelGeneratorConfig: {
    blog: {
      model: "blog",
      url: ({state, key, item, currentLocale, siteData}) => {
        const locale = currentLocale == state.config.defaultLocale ? '/' : currentLocale
        return nodePath.join('/', locale, '/blog', item.url_friendly_name)
      },
      template: 'src/layouts/blog-single',
      getData: ({state, item, currentLocale, allItems}) => {
        // Include category ref
        const page = {
          currentLocale: currentLocale,
          data: item
        }
        return page;
      },
      select: ({state, items}) => {
        let filteredBlogs = []
        const blogsMap = state.models["blog"]
        for (let blogId in blogsMap) {
          const blog = blogsMap[blogId].data;
          const date = new Date(blog.date) // this converts to local time
          const now = new Date();
          const filterDate = new Date();
          filterDate.setFullYear(filterDate.getFullYear() - 1)
          if (date < now) { //} && date >= filterDate) {
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
        //Add extra list-specific data
        filteredBlogs.forEach((blogData, index) => {
          if (index > 0) {
            blogData.nextBlog = {
              title: filteredBlogs[index - 1].id
            }
          }
          if (index < (filteredBlogs.length - 1)) {
            blogData.previousBlog = {
              title: filteredBlogs[index + 1].id      
            }
          }
        })
        //Must return lest of json data objects, not ModelInstance objects
        return filteredBlogs;
      },
      paginate: {
        perPage: 4,
        pageUrl: ({state, currentPage, currentLocale, totalPages, paginate}) => {
          let locale = currentLocale == state.config.defaultLocale ? '/' : currentLocale
          if (currentPage == 1) {
            return nodePath.join('/', locale, '/blog')                         
          } else {
            return nodePath.join('/', locale, '/blog', `page${currentPage}`)             
          }
        },
        getData: ({state, items, currentLocale, currentPage, totalPages, permalink, paginate}) =>  {
          for(let item of items) {
            try {
              item.category = LocalizableData.localize(state.models['category'][item.category].data, currentLocale, state.defaultLocale)    
            } catch(err) {
              console.debug(`Could not find category ${item.category} for blog ${item.id}`)
            }
          }
          let previousUrl, nextUrl = null;
          if (currentPage > 1)
            previousUrl = paginate.pageUrl({state, currentPage: currentPage - 1, currentLocale})
          if (currentPage < totalPages)
            nextUrl = paginate.pageUrl({state, currentPage: currentPage + 1, currentLocale})
            
          return {
            permalink,
            previousUrl,
            nextUrl,
            data: items,
            //regions: page.regions,
            //content: page.content,
            currentLocale,
            pagination: {
              paginationOpts: paginate,
              currentPage,
              totalPages
            }
          }
        },
        template: 'src/layouts/blog-list'
      }
    }
  },
  
  // Document: (props) => {
  //   const { Html, Head, Body, children } = props;
  //   return <Html lang="en-US">
  //     <Head>
  //       <meta charSet="UTF-8" />
  //       <meta name="viewport" content="width=device-width, initial-scale=1" />
  //     </Head>
  //     <Body id="top" >{children}</Body>
  //   </Html>
  // },
  
  maxThreads: 1, // Remove this when you start doing any static generation
  devServer: {
     public: `${process.env.CONTAINER_IP}:3000` || "http://localhost:3000/",
     host: process.env.CONTAINER_IP || "http://localhost:3000/",
     sockHost: process.env.CONTAINER_IP,
     port: 3000,
     allowedHosts: [
       '.pegs.localhost',
       process.env.CONTAINER_IP || "localhost",
       process.env.CONTAINER_DOMAIN || '.web.pegs.com'
     ]
  },
  getSiteData: async (state) => {
    console.log("Reloading site data!")
    const {resources, settings, modelDefinitions, menus} = await state.prepareData(state);
    
    
    console.log("At get site data: " + state.models["blog"]["blog-2020-02-29-185239-38-special-to-play-key-west-31932-494"].data.title)
    
    //const models = await opts.loadModels();
    return {
      locales: state.locales,
      defaultLocale: state.config.defaultLocale,
      modelLinks: state.modelLinks,
      i18nResources: resources,
      settings,
      menus,
      //regionConfig,
      //modelDefinitions // Only include this if really needed to live-parse definisions
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
    
    return [
      // ...makeModelRoutes(state, "blog", filteredBlogs, {
      //   rootPath: '/blogs',
      //   itemTemplate: 'src/layouts/blog-single'
      // }, {
      //   perPage: 4,
      //   rootPath: '/blogs',
      //   pagePrefix: 'page',
      //   pageTemplate: 'src/layouts/blog-list'
      // })
    ]
    
  },
  plugins: [
    ["pegsrs"],
    ["react-static-plugin-sass"]
  ]
  
}
