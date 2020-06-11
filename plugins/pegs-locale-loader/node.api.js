import nodePath from 'path'
import chokidar from 'chokidar'
import nodeGlob from 'glob'
import { pathJoin } from 'react-static'
import { rebuildRoutes } from 'react-static/node'
import fs from 'fs-extra';
import YAML from 'yaml'
import FrontMatterPage from '../pegs-page-loader/FrontMatterPage';

//Items to load (in order)
// * locales
// * models
// * pages
// * menus

//1. Define functions so getState can decide which items to load into global state
//2. Load state: call all functions, only 

const PAGES_LOCATION = "_pages";

export default ({
  location
}) => ({
  afterGetConfig: (state) => {
    state.prepareData = async () => {
      const resources = await loadResources(state)
      const pages = await loadPages(state)
      const siteData = await loadSiteData(state)
      return {
        resources,
        pages,
        ...siteData
      }
    }
    // state.loadResources = loadResources
    // state.loadSiteData = async () => await loadSiteData(state)
    // state.loadPages = async () => await loadPages(state)
    return state
  },
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
  console.log(menus.main.items)
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
