import $ajax from './ajax'

const genApiPath = (path) => {
  return `/api/${path}`
}

export const createAssets = (data) => {
  return $ajax.post(genApiPath('assets'), data)
}

export const getAssets = () => {
  return $ajax.get(genApiPath('assets'))
}

export const updateAssets = (data) => {
  return $ajax.put(genApiPath(`assets`), data)
}

export const getRecords = () => {
  return $ajax.get(genApiPath('records'))
}
