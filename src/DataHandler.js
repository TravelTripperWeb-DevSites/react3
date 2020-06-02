import React, { useState, useEffect } from 'react'
import DataPage from './containers/DataPage'
import DataLoader from './DataLoader'


const DataHandler = (pathData) => {
  const [data, setData] = useState({});
  
  const dl = new DataLoader(); 
  useEffect(() => {
    async function fetchData() {
      const loadedData = await dl.getData();
      console.log(loadedData, pathData.uri);
      setData(loadedData[pathData.uri] || {})      
    }
    fetchData();
  }, [])
  
  return <div>HI {pathData.uri} {data.title} {data.content}</div>
}

export default DataHandler