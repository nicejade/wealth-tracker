import $ajax from './ajax'

const genApiPath = (path) => {
  return `/api/${path}`
}

export const createAssets = (data) => {
  return $ajax.post(genApiPath('assets'), data)
}

export const getAssets = (data = {}) => {
  return $ajax.get(genApiPath('assets'), data)
}

export const updateAssets = (data) => {
  return $ajax.put(genApiPath('assets'), data)
}

export const getRecords = (data = {}) => {
  return $ajax.get(genApiPath('records'), data)
}

export const updateRecords = (data) => {
  return $ajax.post(genApiPath('records'), data)
}

export const destroyRecords = (data) => {
  return $ajax.delete(genApiPath('records'), data)
}
