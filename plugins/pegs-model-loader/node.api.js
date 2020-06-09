import nodePath from 'path'
import chokidar from 'chokidar'
import nodeGlob from 'glob'
import { pathJoin } from 'react-static'
import { rebuildRoutes } from 'react-static/node'
import fs from 'fs-extra';
import YAML from 'yaml'


export default ({
  location
}) => ({
  afterGetConfig: (config) => {
    config.loadModels = loadModels
    return config
  },
})

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
