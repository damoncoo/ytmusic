
function parseCookies(cookies) {
  let cookie = ''
  cookies.forEach(item => {
    cookie += item + ';'
  })
  return cookie
}

module.exports.parseCookies = parseCookies