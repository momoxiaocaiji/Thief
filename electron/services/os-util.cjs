const os = require('node:os')

function dealTime(seconds) {
  let value = seconds | 0
  let day = (value / (3600 * 24)) | 0
  let hours = ((value - day * 3600) / 3600) | 0
  let minutes = ((value - day * 3600 * 24 - hours * 3600) / 60) | 0
  let second = value % 60

  if (day < 10) day = `0${day}`
  if (hours < 10) hours = `0${hours}`
  if (minutes < 10) minutes = `0${minutes}`
  if (second < 10) second = `0${second}`

  return [day, hours, minutes, second].join(':')
}

module.exports = {
  getTime() {
    return `您的开机时长：${dealTime(os.uptime())}`
  },
  getCpu() {
    const freeMem = os.freemem()
    const totalMem = os.totalmem()
    return `${((totalMem - freeMem) / 1024 / 1024 / 1024).toFixed(1)}G/${(
      totalMem /
      1024 /
      1024 /
      1024
    ).toFixed(0)}G`
  }
}
