import axios from 'axios'

const queryString = (url, query) => {
  let str = []
  for (let key in query) {
    str.push(key + '=' + query[key])
  }
  let paramStr = str.join('&')
  return paramStr ? `${url}?${paramStr}` : url
}

const requestHandle = (params) => {
  return new Promise((resolve, reject) => {
    axios(params)
      .then((res) => {
        if (!res || !res.data) {
          reject(`Something Error @${params.url}.`)
        }
        if (res.status === 200) {
          resolve(res.data)
        } else {
          reject(res.statusText)
        }
      })
      .catch((err) => {
        reject(err.response.data)
      })
  })
}

export default {
  post: (url, params) => {
    return requestHandle({
      method: 'post',
      url: url,
      data: params,
    })
  },
  put: (url, params) => {
    return requestHandle({
      method: 'PUT',
      url: url,
      data: params,
    })
  },
  delete: (url, params) => {
    return requestHandle({
      method: 'DELETE',
      url: url,
      data: params,
    })
  },
  get: (url, params) => {
    return requestHandle({
      method: 'get',
      url: queryString(url, params),
    })
  },
}
