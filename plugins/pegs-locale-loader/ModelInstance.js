import fs from 'fs-extra';
import frontMatter from 'front-matter'
import nodeGlob from 'glob'
import YAML from 'yaml'
import nodePath from 'path'
//import LocalizableData from './LocalizableData';
import { pathJoin } from 'react-static'

class ModelInstance {
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
  
  static async load(path, location) {
    let instance = new ModelInstance(path, location);
    return await instance.initialize();
  }

  constructor(path, location) {
    this._path = path;
    this._location = location;
    this._data = {};
    this._rawContent = '';
    this._parsed = {};
    this.initialize = this.initialize.bind(this);
  }
  
  get modelName() {
    let pathParts = this._path.split('/')
    return pathParts[pathParts.length - 2]
  }
  get id() {
    return nodePath.basename(this._path, nodePath.extname(this._path))
  }
  
  get permalink() {
    return `/_data/_models/${this.modelName}/${this.id}`
  }
  
  get data() {
    return {
      ...this._data,
      id: this.id,
      modelDefinitionName: this.modelName
    };
  }
  
  async initialize() {
    this._rawContent = await fs.readFile(this._path, "utf8");
    this._data = JSON.parse(this._rawContent)
    return this;
  }
  
  
}

export default ModelInstance