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
    config.loadResources = loadResources
    config.loadSiteData = loadSiteData
    return config
  },
  beforePrepareRoutes: async (state) => {
    const { stage, config } = state;
    location = location || nodePath.resolve('./_locales');
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
    
    await Promise.all(promises);
    
    state.i18nResources = resources;
    //console.log(state)
    
    
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
    
    
    return state
  }
})

const loadSiteData = async () => {
  return {
    settings: await loadSettings(),
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

const loadSettings = async () => {
  const location = nodePath.resolve('./_data');
  const settingsFileGlob = nodePath.join(location, '*.{yml,yaml}')
  const settingsFiles = await glob(settingsFileGlob)
  
  let promises = []
  //state.locales = []
  let settings = {}
  for(let settingsFile of settingsFiles) {
    const settingsKey = nodePath.basename(settingsFile, nodePath.extname(settingsFile))
    promises.push(loadLocale(settingsFile, settingsKey, settings))
  }
  
  await Promise.all(promises);
  return settings;
}

const loadSetting = async(settingsFile, settingsKey, settings) => {
  const contents = await fs.readFile(settingsFile, "utf8")
  const settingsData = YAML.parse(contents);
  settings[settingsKey] = settingsData
}

const loadResources = async () => {
  const location = nodePath.resolve('./_locales');
  const localesGlob = nodePath.join(location, '*.{yml,yaml}')
  const localeFiles = await glob(localesGlob)
  
  let promises = []
  //state.locales = []
  let resources = {}
  for(let localeFile of localeFiles) {
    const locale = nodePath.basename(localeFile, nodePath.extname(localeFile))
    //state.locales.push(locale);
    promises.push(loadLocale(localeFile, locale, resources))
  }
  
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
