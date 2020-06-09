import fsExtra from 'fs';
import frontMatter from 'front-matter'
import nodeGlob from 'glob'
import YAML from 'yaml'
import nodePath from 'path'
import LocalizableData from './LocalizableData';
import { pathJoin } from 'react-static'

class ModelInstances {
  static async loadSliders(setFunction) {
    let files = await glob("../../_data/_models/homepage_slider/*.json")
    let homepageSliders = {} //[mypost]
    for(let file of files) {
      let data = JSON.parse(await fsExtra.readFile(file))
      data['filename'] = file
      homepageSliders[file] = data
    }
    setFunction(homepageSlider)
  }
  
}

export default ModelInstances