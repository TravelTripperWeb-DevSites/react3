class LocalizableData extends Object {
  static localize(object, locale='en') {
    let objectCopy = {}
    for(let key in object) {
      if (key.match(/_localized$/)) {
        objectCopy[key.replace(/_localized$/,'')] = object[key][locale]
      } else {
        objectCopy[key] = object[key]
      }
    }
    return objectCopy;
  }
}


export default LocalizableData