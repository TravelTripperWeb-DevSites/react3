import nodePath from 'path';

class Category { //extends ModelInstance FromData {
  
  constructor(data) {
    this._data = data;
  }
  
  get data() {
    return this._data;
  }
  
  get currentLocale() {
    return this._data._currentLocale
  }
  get defaultLocale() {
    return this._data._defaultLocale
  }
  
  get url() {
    const locale = this.currentLocale == this.defaultLocale ? '/' : this.currentLocale
    return nodePath.join('/', locale, '/blog', 'category', this.data.url_friendly_name)
  }
  
}

export default Category