import fs from 'fs-extra';
import frontMatter from 'front-matter'
import YAML from 'yaml'
import nodePath from 'path'


class FrontMatterPage {
  static async load(path, location) {
    let page = new FrontMatterPage(path, location);
    return await page.initialize();
  }

  constructor(path, location) {
    this._path = path;
    this._location = location;
    this._data = {};
    this._rawContent = '';
    this._parsed = false;
    
    this.initialize = this.initialize.bind(this);
  }
  
  
  get path() {
    return this._path;
  }

  get data() {
    if (!this._parsed) {
      this.parse();
    }
    return this._data;
  }
  
  get content() {
    if (!this._parsed) {
      this.parse();
    }
    return this._content;
    
  }
  
  get permalink() {
    console.log("get permalink")
    return this.data.permalink || this.filePath
  }

  get filePath() {
    const absPath = nodePath.resolve(this._path)
    return nodePath.relative(this._location, absPath)    
  }
  
  parse() {
    const yamlContent = frontMatter(this._rawContent);
    this._data = {
      ...yamlContent.attributes
    }
    this._content = yamlContent.body
    this._parsed = true;
  }
  
  async initialize() {
    this._rawContent = await fs.readFile(this._path, "utf8");
    console.log("Loaded raw file content", this._path)         
    return this;
  }
  
  
}

export default FrontMatterPage;