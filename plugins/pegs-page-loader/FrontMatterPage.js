import fs from 'fs-extra';
import frontMatter from 'front-matter'
import YAML from 'yaml'
import nodePath from 'path'
import LocalizableData from './LocalizableData';
import { pathJoin } from 'react-static'

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
  
  get content() {
    if (!this._parsed[this.locale]) {
      this.parse();
    }
    return this._content;    
  }
  
  get permalink() {
    console.log("get permalink")
    return this.localizePermalink(this.data.permalink || this.filePath)
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
    console.log(this._data)
    this._content = yamlContent.body
    this._parsed = {};
    this._parsed[this.locale] = true;
  }
  
  async initialize() {
    this._rawContent = await fs.readFile(this._path, "utf8");
    console.log("Loaded raw file content", this._path)         
    return this;
  }
  
  
}

export default FrontMatterPage;