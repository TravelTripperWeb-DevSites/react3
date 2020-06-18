class LocalizableData {
  static localize(object, locale='en', defaultLocale='en') {
    let objectCopy = {}
    for(let key in object) {
      if (key.match(/_localized$/)) {
        objectCopy[key.replace(/_localized$/,'')] = object[key][locale] || object[key][defaultLocale]
      } else {
        objectCopy[key] = object[key]
      }
      if (Array.isArray(objectCopy[key])) {
        let newArray = []
        for(let arrayItem of objectCopy[key]) {
          if (typeof arrayItem === 'object' && !Array.isArray(arrayItem) && arrayItem !== null) {
            newArray.push(LocalizableData.localize(arrayItem, locale, defaultLocale))
          } else {
            newArray.push(arrayItem)
          }
        }
        objectCopy[key] = newArray;
      } else if (typeof objectCopy[key] === 'object' && objectCopy[key] !== null) {
        objectCopy[key] = LocalizableData.localize(objectCopy[key], locale, defaultLocale)
      }
    }
    objectCopy._currentLocale = locale;
    objectCopy._defaultLocale = defaultLocale;
    return objectCopy;
  }
}


export default LocalizableData