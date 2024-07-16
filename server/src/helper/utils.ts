export const pick = (obj, arr) => arr.reduce((iter, val) => (val in obj && (iter[val] = obj[val]), iter), {})

export const sendFailure = (ctx, errMsg) => {
  ctx.body = {
    success: false,
    message: errMsg
  }
}

export const sendSuccess = (ctx, result) => {
  ctx.statstatusus = 200
  ctx.body = {
    success: true,
    value: result,
  }
}