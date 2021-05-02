
module.exports = function getToken(req){
    let token = req.headers['auth-token']; // || req.headers['x-access-token'] || req.headers['authorization'] // Express headers are auto converted to lowercase
    if (token && token.substring(0,7) === 'Bearer ') {
      // Remove Bearer from string
      token = token.slice(7, token.length)
    }
    return token;
}
