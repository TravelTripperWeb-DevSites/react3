import nodePath from 'path'
import chokidar from 'chokidar'
import nodeGlob from 'glob'
import { pathJoin } from 'react-static'
import { rebuildRoutes } from 'react-static/node'
import fs from 'fs-extra';
import YAML from 'yaml'

import ModelInstance from './ModelInstance'

const PUBLIC_API_MODELS_DIR = nodePath.resolve('./public/api/models/')

export default ({
  location,
  createRoute = d => d,
}) => ({
  beforePrepareRoutes: async (state) => {
    const { stage, config } = state;
    location = location || nodePath.resolve('./_data/_models/');
    const modelsGlob = nodePath.join(location, '**', `*.json`)
    const models = await glob(modelsGlob)
    
    let modelList = {}
    
    const handle = (models) => {
      // Turn each page into a route
      
      let promises = []
      for (let modelPath of models) {
        promises.push(generateModel(modelPath, modelList))
      }
      return Promise.all(promises)
    }
    
    //Remove public/api dir
    await fs.remove(PUBLIC_API_MODELS_DIR)
    await handle(models)
    
    //Look through modelList types and generate index pages
    let idxPromises = [];
    for (let modelName in modelList) {
      const allInstanceData = modelList[modelName]
      const modelIdxPath = nodePath.join(PUBLIC_API_MODELS_DIR, `${modelName}.json`)
      idxPromises.push(fs.writeJson(modelIdxPath, allInstanceData))
    }
    
    await Promise.all(idxPromises);
    
    state.models = modelList;
    return state;
  }
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


const generateModel = async(modelFile, modelList) => {
  
  const pathParts = modelFile.split('/');
  const modelName = pathParts[pathParts.length-2]
  
  const modelInstanceName = nodePath.basename(modelFile, nodePath.extname(modelFile))
  
  await fs.mkdirp(nodePath.join(PUBLIC_API_MODELS_DIR, modelName))
  
  await fs.copyFile(modelFile, nodePath.join(PUBLIC_API_MODELS_DIR, modelName, `${modelInstanceName}.json`))
  
  const model = await ModelInstance.load(modelFile);
  modelList[model.modelName]=modelList[model.modelName] || {}
  modelList[model.modelName][model.modelId] = model
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
  modelData.id = modelInstanceName;
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
