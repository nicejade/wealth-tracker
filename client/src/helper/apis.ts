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

export const destroyAssets = (data) => {
  return $ajax.delete(genApiPath('assets'), data)
}

export const checkPassword = (data = {}) => {
  return $ajax.get(genApiPath('password/check'), data)
}

export const verifyPassword = (password: string) => {
  return $ajax.post(genApiPath('password/verify'), { password })
}

export const setPassword = (password: string) => {
  return $ajax.post(genApiPath('password/set'), { password })
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

export const createInsights = (data) => {
  return $ajax.post(genApiPath('insights'), data)
}

export const getInsights = (data = {}) => {
  return $ajax.get(genApiPath('insights'), data)
}

export const updateInsights = (data) => {
  return $ajax.put(genApiPath('insights'), data)
}

export const destroyInsights = (data) => {
  return $ajax.delete(genApiPath('insights'), data)
}

export const getInsightsCalendarData = (data) => {
  return $ajax.get(genApiPath('insights/calendar'), data)
}

export const resetDatabase = () => {
  return $ajax.post(genApiPath('reset'), {})
}

export const generateAdvice = (data) => {
  return $ajax.post(genApiPath('generate-advice'), data)
}
