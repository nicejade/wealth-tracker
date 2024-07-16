import $ajax from './ajax'

const genApiPath = (path) => {
  return `/api/${path}`
}

export const create = (data) => {
  return $ajax.post(genApiPath('create'), data)
}

export const update = (data) => {
  return $ajax.post(genApiPath('update'), data)
}

export const destroy = () => {
  return $ajax.post(genApiPath('destroy'))
}

export const getAssets = () => {
  return $ajax.get(genApiPath('getAssets'))
}

export const getRecords = () => {
  return $ajax.get(genApiPath('getRecords'))
}

export const getApi = () => {
  return $ajax.get(genApiPath('heart'))
}
