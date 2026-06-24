export default {
  readFileBuffer(filePath) {
    return window.thief.file.readFileBuffer(filePath)
  },
  toFileUrl(filePath) {
    return window.thief.file.toFileUrl(filePath)
  }
}
