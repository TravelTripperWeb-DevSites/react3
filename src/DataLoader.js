import axios from 'axios'


class DataLoader {
    
    
  async getData() {
    let index = await axios.get('/_data/')
    let dataSources = {};
    if (index && index.status == 200 && index.data) {
      for(let fileName of index.data) {
        let fileContents = await axios.get(`/_data/${fileName.name}`);
        if (fileContents && fileContents.status == 200) {
          let fileData = fileContents.data;
          dataSources[fileData.permalink || fileName] = fileData
        }
      }
    }
    return dataSources;
  }
    
}

export default DataLoader;
