const expressJwt = require('express-jwt')
const config = require('../config')

module.exports = function jwt () {
  const secret = config.secret; 
  return expressJwt({secret}).unless({
    path: [
      // public routes that don't require authentication
      '/user/authenticate'
    ]
  })
}
