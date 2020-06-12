import ModelInstance from './ModelInstance'
import nodePath from 'path';
import glob from './glob';
import fs from 'fs-extra';

import LocalizableData from '../pegs-page-loader/LocalizableData'

// state.config.modelGeneratorConfig = {
//  "key": {
//     // items: any list of items
//     model: 'blogs',
//     select: ({state, items}) => (sort & filter, return itemList)
//     url: ({state, key, item}) => return permalink & store in state
//     template: 'src/layouts/blog-single'
//     getData: ({state, item, currentLocale, allItems}) => for routes
//     paginate: {
//         perPage: 4,
//         mainUrl: ({state, currentPage, currentLocale, perPage, totalPages, paginage}) => '/blogs/page:num',
//         pageUrl: ({state, currentPage, currentLocale, perPage, totalPages, paginage}) => '/blogs/page:num',
//         getData: ({state, items, currentLocale, currentPage, totalPages, permalink, paginate}) => for routes
//         template: 'src/layouts/blog-list'
//     }
//   }
// }
export const PUBLIC_API_MODELS_DIR = nodePath.resolve('./public/api/models/')

const generateModelPages = (state) => {
  state.modelLinks = {}
  state.modelsToGenerate = {}

  for(let key in state.config.modelGeneratorConfig) {
    console.log(`Setting up model generator for ${key}`)
    const config = state.config.modelGeneratorConfig[key];
    for(let currentLocale of state.locales) {
      
    }
    let items = config.items;
    if (!items && config.model) {
      const modelMap = state.models[config.model];
      items = [];
      if (modelMap) {
        for(let modelId in modelMap) {
          items.push(modelMap[modelId])
        }        
      } else {
        console.error(`No state models for "${key}:${config.model}"`)
      }
    }
    let skip = false
    if (!items) {
      console.error(`No items enabled for model generator "${key}"`)
      skip = true
    }
    if (!config.url) {
      console.error(`No url function for model generator "${key}"`)
      skip = true      
    }
    
    if (!skip) {
      state.modelLinks[key]       = {};
      state.modelsToGenerate[key] = {
        items: [], 
        config
      }
      
      
      if (typeof config.select === 'function') {
        items = config.select({state, items});
      } 
      items = items.map((item) => {
        return (item instanceof ModelInstance ? item.data : item)
      })
      
      items.forEach((item) => {
        state.modelLinks[key][item.id] = state.modelLinks[key][item.id] || {}      
        state.modelsToGenerate[key].items[item.id] = state.modelsToGenerate[key].items[item.id] || {}
      
        let itemLocales = {}
        for (let currentLocale of state.locales) {
          const itemData = LocalizableData.localize(item, currentLocale, state.defaultLocale)
          const path = nodePath.join('/', config.url({state, key, item: itemData, currentLocale}));
          itemData.permalink = path;
          
          state.modelLinks[key][item.id][currentLocale] = path;          
          itemLocales[currentLocale] = itemData;
        }     
        state.modelsToGenerate[key].items.push(itemLocales)         
      })
    }    
  }
}


const generateModel = async (modelFile, modelList) => {
  
  const pathParts = modelFile.split('/');
  const modelName = pathParts[pathParts.length-2]
  
  const modelInstanceName = nodePath.basename(modelFile, nodePath.extname(modelFile))
  
  await fs.mkdirp(nodePath.join(PUBLIC_API_MODELS_DIR, modelName))
  
  await fs.copyFile(modelFile, nodePath.join(PUBLIC_API_MODELS_DIR, modelName, `${modelInstanceName}.json`))
  
  const model = await ModelInstance.load(modelFile);

  modelList[model.modelName]=modelList[model.modelName] || {}
  modelList[model.modelName][model.id] = model
}

export default async function loadModels(state) {
  console.log("loading models")
  const location = nodePath.resolve('./_data/_models/');
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
  
  
  
  console.log("republished models API")


  //Look through modelList types and generate index pages
  let idxPromises = [];
  for (let modelName in modelList) {
    const allInstanceData = modelList[modelName]
    const modelIdxPath = nodePath.join(PUBLIC_API_MODELS_DIR, `${modelName}.json`)
    idxPromises.push(fs.writeJson(modelIdxPath, allInstanceData))
  }

  await Promise.all(idxPromises);
  console.log("published models index API")

  state.models = modelList;
  generateModelPages(state);
  console.log("generated model pages")
  
  return modelList;
}
