module.exports =
  class appKey {

    constructor () {}

    getKey (token, partIndex) {

      // Decode base64
      let b = new Buffer.from(token, 'base64')
      let hashKey = b.toString()

      // Get the secret for this Key
      let keyArray = (hashKey + '').split(':')
      let hash = keyArray[0]
      let key = keyArray[1]

      return keyArray[partIndex];
    }

}
