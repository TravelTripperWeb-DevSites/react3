// Based on https://github.com/react-static/react-static/blob/master/packages/react-static-plugin-source-filesystem/src/node.api.js

import nodePath from 'path'
import chokidar from 'chokidar'
import nodeGlob from 'glob'
import { pathJoin } from 'react-static'
import { rebuildRoutes } from 'react-static/node'

import FrontMatterPage from './FrontMatterPage'

export default ({
  location,
  pathPrefix,
  createRoute = d => d,
  extensions = [],
}) => ({
  getRoutes: async (routes, state) => {
    const { config, stage, debug, models } = state;
    //console.log(state);
    location = location || nodePath.resolve('./_pages');

    // Make a glob extension to get all pages with the set extensions from the pages directory
    // It should be a directory, not index.js inside that directory. This will
    // happen when using .resolve in some instances
    if (/index\.js$/.test(location)) {
      location = nodePath.dirname(location)
    }

    // Make a glob extension to get all pages with the set extensions from the
    // pages directory
    const globExtensions = [...config.extensions, ...extensions, '.html']
      .map(ext => `${ext.slice(1)}`) // cut off the period of the extension
      .join(',') // join them for the glob string
    const pagesGlob = nodePath.join(location, '**', `*.{${globExtensions}}`)
    // Get the pages

    if (debug) {
      console.log(`Importing directory routes from: ${pagesGlob}`)
    } else {
      console.log('Importing routes from directory...')
    }

    const handle = (pageMap) => {
      // Turn each page into a route
      
      let promises = []
      for (let pageId in pageMap) {
        for (let locale in pageMap[pageId]) {
          const page = pageMap[pageId][locale]
          promises.push(handlePage(page, createRoute, models, locale))
        }
      }
      
      return Promise.all(promises)
    }
    
    // Trigger a getRoutes rebuild when items in
    // the directory change
    if (stage === 'dev') {
      const watcher = chokidar
        .watch(location, {
          ignoreInitial: true,
        })
        .on('all', async (type, file) => {
          console.log(type, file)
          const filename = nodePath.basename(file)
          if (filename.startsWith('.')) {
            return
          }

          console.log(
            `File ${type === 'add' ? 'Added' : 'Removed'}: ${nodePath.relative(
              config.paths.ROOT,
              nodePath.resolve(location, filename)
            )}`
          )
          watcher.close()
          rebuildRoutes()
        })
    }

    const directoryRoutes = await handle(state.pages)
    //console.log(directoryRoutes)
    return [...routes, ...directoryRoutes]
  },
})

const handlePage = async (page, createRoute, models, locale) => {
  const originalPath = page.filePath;
  
  let path = page.permalink;
  
  // // Cutoff the extension
  // path = nodePath.join(
  //   nodePath.dirname(path),
  //   nodePath.basename(path, nodePath.extname(path))
  // )
  //
  // // Ensure paths are unix
  // path = path.split(nodePath.sep).join(nodePath.posix.sep)
  //
  // // Make sure it starts with a slash
  // path = path[0] === '/' ? path : `/${path}`
  //
  // // Turn `/index` paths into roots`
  // path = path.replace(/\/index$/, '/')

  // Return the route
  return await createRoute({
    path,
    template: `src/layouts/${page.layout}`,
    originalPath,
    getData: async () => {    
      return {
        permalink: path,
        data: page.data,
        models: page.modelsNeeded.reduce((list,k) => {
          const instances = models[k];
          list[k] = {}
          for(let id in instances) {
            list[k][id] = instances[id].data;
          }
          return list;
        }, {}),
        regions: page.regions,
        content: page.content,
        filePath: page.filePath,
        currentLocale: locale
      }
    }
  })
}



function glob(path, options = {}) {
  return new Promise((resolve, reject) =>
    nodeGlob(path, options, (err, files) => {
      if (err) {
        return reject(err)
      }
      resolve(files)
    })
  )
}