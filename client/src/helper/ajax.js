import axios from 'axios'

function queryString(url, query) {
  let str = []
  for (let key in query) {
    str.push(key + '=' + query[key])
  }
  let paramStr = str.join('&')
  return paramStr ? `${url}?${paramStr}` : url
}

function requestHandle(params) {
  return new Promise((resolve, reject) => {
    axios(params)
      .then((res) => {
        if (res && (res.unauthorized || res.statusCode === 401)) {
          window.location.href = '/login'
        }
        if (res.type === 'application/x-msdownload') {
          redirectToIframe(res.request.responseURL)
        } else if (res.data) {
          if (res.status === 200) {
            resolve(res.data)
          } else {
            reject(res.statusText)
          }
        } else {
          reject(`Something Error @${params.url}.`)
        }
      })
      .catch((err) => {
        reject(err.response.data)
      })
  })
}

function redirectToIframe(url) {
  let iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = url
  iframe.onload = function () {
    document.body.removeChild(iframe)
  }
  document.body.appendChild(iframe)
}

export default {
  post: function (url, params, op) {
    return requestHandle({
      method: 'post',
      url: url,
      data: params,
    })
  },
  get: function (url, params, op) {
    return requestHandle({
      method: 'get',
      url: queryString(url, params),
    })
  },
}
