import nodePath from 'path'
import glob from './glob'
import { rebuildRoutes, rebuildSiteData } from 'react-static/node';
import chokidar from 'chokidar'
import { pathJoin } from 'react-static'
import fs from 'fs-extra';
import YAML from 'yaml'
import FrontMatterPage from './FrontMatterPage';

import loadModels from './loadModels';

//Items to load (in order)
// * locales
// * models
// * pages
// * menus

//1. Define functions so getState can decide which items to load into global state
//2. Load state: call all functions, only 

const PAGES_LOCATION = "_pages";

export default ({
  location,
  createRoute = d => d,
}) => ({
  afterGetConfig: (state) => {
    state.prepareData = async (state) => {
      console.log("Preparing CMS Data")
      const resources = await loadResources(state)

      await loadModels(state);
      await loadPages(state);
      
      // Locale content, settings files, menus and (potentially) definitions
      // are used in useSiteData hooks
      
      const siteData = await loadSiteData(state)
      return {
        resources,
        ...siteData
      }
    }
    return state
  },
  beforePrepareRoutes: async (state) => {
    // Page and model content get transformed to page-specific data durring routes creation
    console.log("At before prep: ")
  },
  getRoutes: async (routes, state) => {
    let singleModelRoutes = [];
    let paginationRoutes = [];
    console.log("PegsRS getRoutes")
    for(let key in state.modelsToGenerate) {
      const {modelsConfig, items} = state.modelsToGenerate[key];
      const paginate = modelsConfig.paginate
      let itemGroup = [];
      let currentPage = 1;
      let totalPages = paginate ? Math.ceil(items.length / paginate.perPage) : null
      const lastIndex = items.length-1
      items.forEach((localizedItems, index) => {
        let generatePage = false;
        if (paginate) {
          itemGroup.push(localizedItems)
          if (itemGroup.length == paginate.perPage || index == lastIndex) {
            generatePage = true
          }
        }        
        
        for (let currentLocale in localizedItems) {
          const item = localizedItems[currentLocale]
          
          const data = (modelsConfig.getData ? modelsConfig.getData({state, item, currentLocale, items}) : item)
          singleModelRoutes.push(createRoute({
            path: nodePath.join('/', item.permalink),
            template: modelsConfig.template,
            getData: () => data,
          }))
          if (generatePage) {
            const paginationItems = itemGroup.map((localizedItem)=>localizedItem[currentLocale])
            const permalink = nodePath.join('/', paginate.pageUrl({state, currentPage, currentLocale, totalPages, paginate}))
            const data = paginate.getData({state, items: paginationItems, currentLocale, currentPage, totalPages, paginate, permalink}) 
            paginationRoutes.push(createRoute({              
              path: permalink,
              template: paginate.template,
              getData: () => data             
            }))
          }
        }
        if (generatePage) {
          generatePage = false;
          currentPage += 1;
          itemGroup = []          
        }        
      })
      // Generate the last pagination page
      if (itemGroup.length > 0) {
        
      }
      
    }
    
    
    const pageRoutes = generatePageRoutes(state)
    
    if (state.stage == "dev") {
      //
      let areRoutesBuilt = false;
      const watcher = chokidar.watch(['./_data', './_locales', './_pages'], {
        ignoreInitial: true
      }).on('all', async (type, file) => {
        const filename = nodePath.basename(file)
        if (filename.startsWith('.')) {
          return
        }
        
        console.log(
          `File ${type}: ${nodePath.relative(
            config.paths.ROOT,
            nodePath.resolve(filename)
          )}`
        )

        // Stop watching while we process?
        watcher.close()
        
        let latestState = await rebuildSiteData();
        rebuildRoutes(latestState);
      })
    }
    
    
    
    return [...routes, ...paginationRoutes, ...singleModelRoutes, ...pageRoutes]
  }
  // beforePrepareRoutes: async (state) => {
  //   const { stage, config } = state;
  //   location = location || nodePath.resolve('./_locales');
  //   const localesGlob = nodePath.join(location, '*.{yml,yaml}')
  //   const localeFiles = await glob(localesGlob)
  //
  //   let promises = []
  //
  //   let resources = {}
  //   for(let localeFile of localeFiles) {
  //     const locale = nodePath.basename(localeFile, nodePath.extname(localeFile))
  //     state.locales.push(locale);
  //     promises.push(loadLocale(localeFile, locale, resources))
  //   }
  //
  //   await Promise.all(promises);
  //
  //   state.i18nResources = resources;
  //
  //
  //   return state
  // }
})

const loadSiteData = async (state) => {
  let [settings, menus] = await loadSettings(state);
  return {
    settings,
    menus,
    modelDefinitions: await loadDefinitions(),
    //regionConfig: await loadRegionConfig()
  }
}

const loadDefinitions = async () => {
  const location = nodePath.resolve('./_data/_definitions');
  const defFileGlob = nodePath.join(location, '*.json')
  const defFiles = await glob(defFileGlob)
  
  let promises = []
  //state.locales = []
  let definitions = {}
  for(let defFile of defFiles) {
    const modelName = nodePath.basename(defFile, nodePath.extname(defFile))
    promises.push(loadModelDefinition(defFile, modelName, definitions))
  }
  
  await Promise.all(promises);
  return definitions;
}

const loadModelDefinition = async(defFile, modelName, definitions) => {
  const data = await fs.readJson(defFile)
  definitions[modelName] = data
}

const loadSettings = async (state) => {
  const location = nodePath.resolve('./_data');
  const settingsFileGlob = nodePath.join(location, '*.{yml,yaml}')
  const settingsFiles = await glob(settingsFileGlob)
  
  let promises = []
  //state.locales = []
  let settings = {}
  for(let settingsFile of settingsFiles) {
    const settingsKey = nodePath.basename(settingsFile, nodePath.extname(settingsFile))
    promises.push(loadSetting(settingsFile, settingsKey, settings))
  }
  
  await Promise.all(promises);
  
  let menus = await loadMenus(settings, state);
  
  return [settings, menus];
}

const loadSetting = async(settingsFile, settingsKey, settings) => {
  const contents = await fs.readFile(settingsFile, "utf8")
  const settingsData = YAML.parse(contents);
  settings[settingsKey] = settingsData
}

const loadMenus = async (settings, state) => {
  let menus = {}
  if (settings["_menus"]) {
    menus = {...settings["_menus"]}
    for(let menuId in menus) {
      await processMenuPages(menus[menuId].items, state)
    }
  }
  return menus;
}

const hasUrl = (item) => {
  return !!(item.url || item.url_localized)
}

const hasLabel = (item) =>  {
  return !!(item.label || item.label_localized)
}

const processMenuPages = async (itemList, state) => {
  let location = location || nodePath.resolve('./');
  if (!itemList) { return };
  for(let item of itemList) {
    if(item.page_id && (!hasUrl(item) || !hasLabel(item))) {
      let pageGroup = state.pages[item.page_id] || state.pages[nodePath.relative(PAGES_LOCATION, item.page_id)]
      if (pageGroup) {
        if (!hasUrl(item)) {
          item.url_localized = {}
          for(let locale in pageGroup) {
            item.url_localized[locale] = pageGroup[locale].permalink
          }          
        }
        
        if (!hasLabel(item)) {
          item.label_localized = {}
          for(let locale in pageGroup) {
            item.label_localized[locale] = pageGroup[locale].navLabel
          }          
        }        
      }
    }
  }
}

const loadPages = async (state) => {
  const { config } = state;
  const location = nodePath.resolve('./_pages');
  const globExtensions = [...config.extensions, '.html']
      .map(ext => `${ext.slice(1)}`) // cut off the period of the extension
      .join(',') // join them for the glob string
  const pagesGlob = nodePath.join(location, '**', `*.{${globExtensions}}`)
  
  const pages = {};
  
  const defaultLocale = state.defaultLocale || 'en';
  const locales = state.locales || [defaultLocale];
  

  const loadPage = async (pagePath, locale) => {
    const page = await FrontMatterPage.load(pagePath, location, locale, defaultLocale)
    pages[page.filePath] = pages[page.filePath] || {};
    pages[page.filePath][locale] = page;
  }

  const loadPagesFromPaths = (pagePaths) => {
    let promises = [];
    
    for (let locale of locales) {
      for (let pagePath of pagePaths) {
        promises.push(loadPage(pagePath, locale))
      }
    }
    return Promise.all(promises)
  }
  
  const pagePaths = await glob(pagesGlob);
  await loadPagesFromPaths(pagePaths);
  state.pages = pages;
  
  return pages;
}

const loadResources = async (state) => {
  const location = nodePath.resolve('./_locales');
  const localesGlob = nodePath.join(location, '*.{yml,yaml}')
  const localeFiles = await glob(localesGlob)
  
  let promises = []
  state.locales = []
  let resources = {}
  for(let localeFile of localeFiles) {
    const locale = nodePath.basename(localeFile, nodePath.extname(localeFile))
    state.locales.push(locale);
    promises.push(loadLocale(localeFile, locale, resources))
  }
  
  state.i18nResources = resources;
  
  await Promise.all(promises);
  return resources;
}



const loadLocale = async (localeFile, locale, resources) => {
  const contents = await fs.readFile(localeFile, "utf8")
  const localeData = YAML.parse(contents);
  resources[locale] = {'translation': localeData}
}

const generatePageRoutes = async(state) => {
  const { config, stage, debug, models } = state;
  const location = nodePath.resolve('./_pages');
  const pagesGlob = nodePath.join(location, '*.html')
  
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
  
  return await handle(state.pages)  
}

const handlePage = async (page, createRoute, models, locale) => {
  const originalPath = page.filePath;
  
  let path = page.permalink;
  
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

