import nodePath from 'path'
import chokidar from 'chokidar'
import nodeGlob from 'glob'
import { pathJoin } from 'react-static'
import { rebuildRoutes } from 'react-static/node'
import fs from 'fs-extra';
import YAML from 'yaml'

import ModelInstance from './ModelInstance'



export default ({
  location,
  createRoute = d => d,
}) => ({
  beforePrepareRoutes: async (state) => {
    const { stage, config } = state;
    location = location || nodePath.resolve('./_data/_models/');
    const modelsGlob = nodePath.join(location, '**', `*.json`)
    const models = await glob(modelsGlob)
    
    const handle = (models) => {
      // Turn each page into a route
      
      let promises = []
      for (let modelPath of models) {
        promises.push(generateModel(modelPath, location))
      }
      return Promise.all(promises)
    }
    
    await handle(models)
    
    return state;
  },
  getRoutes: async (routes, state) => {
    return routes
    const { config, stage, debug } = state;
    console.log(state);
    location = location || nodePath.resolve('./_data/_models/');

    // Make a glob extension to get all pages with the set extensions from the pages directory
    // It should be a directory, not index.js inside that directory. This will
    // happen when using .resolve in some instances
    if (/index\.js$/.test(location)) {
      location = nodePath.dirname(location)
    }

    // Make a glob extension to get all pages with the set extensions from the
    // pages directory
    const modelsGlob = nodePath.join(location, '**', `*.json`)

    const handle = (models) => {
      // Turn each page into a route
      
      let promises = []
      for (let modelPath of models) {
        promises.push(handleModel(modelPath, location, createRoute))
      }
      return Promise.all(promises)
    }
    
    const models = await glob(modelsGlob)
    const modelJsonRoutes = await handle(models)
    console.log(modelJsonRoutes)
    return [...routes, ...modelJsonRoutes]
  },
})

const handleModel = async (modelPath, location, createRoute) => {
  const model = await ModelInstance.load(modelPath, location);
  const originalPath = modelPath;
  
  // Glob path will always have unix style path, convert to windows if necessary
  let path = model.permalink;
  
  return await createRoute({
    path,
    template: './plugins/pegs-model-loader/ModelPage',
    originalPath,
    getData: async () => ({
      data: model.data
    })
  })
}


const generateModel = async(modelFile) => {
  const dir = nodePath.resolve('./public/_models/')
  const pathParts = modelFile.split('/');
  const modelName = pathParts[pathParts.length-2]
  
  const modelInstanceName = nodePath.basename(modelFile, nodePath.extname(modelFile))
  
  await fs.mkdir(nodePath.join(dir, modelName), {recursive: true})
  
  await fs.copyFile(modelFile, nodePath.join(dir, modelName, `${modelInstanceName}.json`))
}

const loadModels = async () => {
  const location = nodePath.resolve('./_data/_models');
  const modelsGlob = nodePath.join(location, '**/*.json')
  const modelFiles = await glob(modelsGlob)
  
  let promises = []
  //state.locales = []
  let models = {}
  for(let modelFile of modelFiles) {
    promises.push(loadModel(modelFile, models))
  }
  
  await Promise.all(promises);
  return models;
}

const loadModel = async (modelFile, models) => {
  const pathParts = modelFile.split('/');
  const modelName = pathParts[pathParts.length-2]
  models[modelName] = models[modelName] || {}

  const modelInstanceName = nodePath.basename(modelFile, nodePath.extname(modelFile))
  const contents = await fs.readFile(modelFile, "utf8")
  const modelData = JSON.parse(contents);
  models[modelName][modelInstanceName] = modelData;
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
