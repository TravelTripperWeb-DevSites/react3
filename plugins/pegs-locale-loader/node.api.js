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
    return config
  },
  beforePrepareRoutes: async (state) => {
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
    return state
  }
})

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
