const axios = require('axios')

const url = 'http://hq.sinajs.cn/list='

module.exports = {
  async getData(code) {
    const codeArr = (code || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)

    if (codeArr.length === 0) {
      return ''
    }

    const results = await Promise.all(
      codeArr.map(item =>
        axios.get(`${url}${item}`, {
          responseType: 'text',
          transformResponse: value => value,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
          }
        })
      )
    )

    return results
      .map(({ data }) => {
        const arr = String(data).split(',')
        const yesterdayPrice = parseFloat(arr[2] || 0)
        const currPrice = parseFloat(arr[3] || 0)

        if (!yesterdayPrice || !currPrice) {
          return '0.00,0.00%'
        }

        const percentage = ((currPrice - yesterdayPrice) / yesterdayPrice) * 100
        return `${currPrice.toFixed(2)},${percentage.toFixed(2)}%`
      })
      .join('||')
  }
}
