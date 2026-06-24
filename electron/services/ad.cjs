const axios = require('axios')

const url = 'http://ad.c.team/ad?p=thief-book'

module.exports = {
  async getAd() {
    try {
      const response = await axios.get(url, {
        responseType: 'text',
        transformResponse: value => value
      })
      return response.data
    } catch {
      return 'err'
    }
  }
}
