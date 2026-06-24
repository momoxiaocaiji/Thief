'use strict'

export default {
  showOpenFile(callback) {
    callback(window.thief.dialog.openText())
  },
  showOpenVideoFile(callback) {
    callback(window.thief.dialog.openVideo())
  },
  showOpenPdfFile(callback) {
    callback(window.thief.dialog.openPdf())
  }
}
