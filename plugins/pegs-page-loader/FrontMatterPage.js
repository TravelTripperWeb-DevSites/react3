import fs from 'fs-extra';
import frontMatter from 'front-matter'
import nodeGlob from 'glob'
import YAML from 'yaml'
import nodePath from 'path'
import LocalizableData from './LocalizableData';
import { pathJoin } from 'react-static'

import {parseHtml} from '../../src/pegs-web/pageParser.js';

class FrontMatterPage {
  static async load(path, location, locale, defaultLocale) {
    let page = new FrontMatterPage(path, location, locale, defaultLocale);
    return await page.initialize();
  }

  constructor(path, location, locale, defaultLocale) {
    this._path = path;
    this._location = location;
    this._data = {};
    this._rawContent = '';
    this._parsed = {};
    this.locale = locale;
    this.defaultLocale = defaultLocale;
    this.initialize = this.initialize.bind(this);
  }
  
  get locale() {
    return this._locale || 'en';
  }
  set locale(val) {
    this._locale = val;
  }

  get defaultLocale() {
    return this._defaultLocale || 'en';
  }
  set defaultLocale(val) {
    this._defaultLocale = val;
  }
  
  get path() {
    return this._path;
  }

  get data() {
    if (!this._parsed[this.locale]) {
      this.parse();
    }
    return this._data;
  }
  
  get modelsNeeded() {
    return (this.data.preLoadModels || [])
  }
  
  get content() {
    if (!this._parsed[this.locale]) {
      this.parse();
    }
    return this._content;
  }
    
  get permalink() {
    return this.localizePermalink(this.data.permalink || this.filePath)
  }

  get layout() {
    return this.data.layout;
  }
  
  get regions() {
    return this._regionFiles || {}; 
  }

  get filePath() {
    const absPath = nodePath.resolve(this._path)
    return nodePath.relative(this._location, absPath)    
  }
  
  localizePermalink(path) {
    if (this.locale == this.defaultLocale) {
      return path;
    } else {
      return pathJoin(this.locale, path);
    }
  }
  
  parse() {
    const yamlContent = frontMatter(this._rawContent);
    this._data = LocalizableData.localize(yamlContent.attributes, this.locale, this.defaultLocale);
    this._content = yamlContent.body
    this._parsed = {};
    this._parsed[this.locale] = true;
  }
  
  glob(path, options = {}) {
    return new Promise((resolve, reject) =>
      nodeGlob(path, options, (err, files) => {
        if (err) {
          return reject(err)
        }
        resolve(files)
      })
    )
  }
  
  async loadRegionFile(regionFilePath) {
    const regionName = nodePath.basename(regionFilePath, nodePath.extname(regionFilePath))
    const regionFileData = await fs.readFile(regionFilePath, "utf8");
    this._regionFiles[regionName]= JSON.parse(regionFileData).map(regionItem => LocalizableData.localize(regionItem, this.locale, this.defaultLocale));
    return;
  }
  
  loadRegionFiles(regionFiles) {
    let promises = []
    this._regionFiles = {}
    for (let regionFilePath of regionFiles) {
      promises.push(this.loadRegionFile(regionFilePath))
    }    
    return Promise.all(promises)
  }
  
  async initialize() {
    this._rawContent = await fs.readFile(this._path, "utf8");
    const regionsDir = nodePath.join(this._location, "../public/_data/_regions")
    const regionFolder = nodePath.join(this.locale, this.filePath);
    const regionFiles = await this.glob(nodePath.join(regionsDir, regionFolder,'*.json'))
    await this.loadRegionFiles(regionFiles)
    
    return this;
  }
  
  
}

export default FrontMatterPage;