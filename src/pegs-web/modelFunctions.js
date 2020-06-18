import React, {useEffect, useState } from 'react';
import axios from 'axios';

const loadModels = async (modelName) => {
  const response = await axios.get(`/api/models/${modelName}.json`)
  if (response.status == 200) {
    return response.data
  } else {
    console.error(response)
    return {}
  }
}

const loadModel = async (modelName, modelInstanceId) => {
  const response = await axios.get(`/api/models/${modelName}/${modelInstanceId}.json`)
  if (response.status == 200) {
    return response.data
  } else {
    console.error(response)
    return {}
  }
}


export const useModel = (page, modelName) => {
  const models = page.models[modelName]
  console.log(models)
  const [modelInstances, setModelInstances] = useState(models);
  
  useEffect(() => {
    console.log('use effect!', models)
    if (!models) {
      loadModels(modelName).then((modelsFromAPI)=>setModelInstances(modelsFromAPI));
    }
    //dynamic load if not present in page.models
  }, [])
  
  return [modelInstances, setModelInstances]  
}

export const useModelInstance = (page, modelName, modelInstanceId, defaultModelInstnace) => {
  const models = page.models ? page.models[modelName] : null
  let model = defaultModelInstnace || (models ? models[modelInstanceId] : null)
  const [modelInstance, setModelInstance] = useState(model);
  
  useEffect(() => {
    console.log('use model effect!', model)
    if (!model) {
      loadModel(modelName, modelInstanceId).then((modelFromAPI)=>setModelInstance(modelFromAPI));
    }
    //dynamic load if not present in page.models
  }, [])
  
  return [modelInstance, setModelInstance]  
  
}