const fs = require('node:fs')
const iconv = require('iconv-lite')
const db = require('./db.cjs')

const bookState = {
  curr_page_number: 1,
  page_size: 50,
  page: 0,
  start: 0,
  end: 50,
  filePath: '',
  errCode: false
}

const textCache = {
  filePath: '',
  errCode: false,
  lineBreak: '',
  mtimeMs: 0,
  text: ''
}

function init() {
  bookState.filePath = db.get('current_file_path')
  bookState.errCode = db.get('errCodeChecked')
  bookState.page_size = Number(db.get('page_size') || 20)
}

function getSize(text) {
  const size = text.length
  bookState.page = Math.ceil(size / bookState.page_size)
}

function getPage(type) {
  const currPage = Number(db.get('current_page') || 1)
  let page = 0

  if (type === 'previous') {
    page = currPage <= 1 ? 1 : currPage - 1
  } else if (type === 'next') {
    page = currPage >= bookState.page ? bookState.page : currPage + 1
  } else {
    page = currPage
  }

  bookState.curr_page_number = page
}

function updatePage() {
  db.set('current_page', bookState.curr_page_number)
}

function getStartEnd() {
  bookState.start = bookState.curr_page_number * bookState.page_size
  bookState.end = bookState.curr_page_number * bookState.page_size - bookState.page_size
}

function readFile() {
  if (!bookState.filePath) {
    return '请选择TXT小说路径'
  }

  const lineBreak = db.get('line_break')

  try {
    const stat = fs.statSync(bookState.filePath)

    if (
      textCache.text &&
      textCache.filePath === bookState.filePath &&
      textCache.errCode === bookState.errCode &&
      textCache.lineBreak === lineBreak &&
      textCache.mtimeMs === stat.mtimeMs
    ) {
      return textCache.text
    }

    const data = fs.readFileSync(bookState.filePath)
    const decoded = bookState.errCode
      ? iconv.decode(data, 'gb18030')
      : iconv.decode(data, 'utf-8')

    const normalized = decoded
      .replace(/\n/g, lineBreak)
      .replace(/\r/g, ' ')
      .replace(/　　/g, ' ')
      .replace(/ /g, ' ')

    textCache.filePath = bookState.filePath
    textCache.errCode = bookState.errCode
    textCache.lineBreak = lineBreak
    textCache.mtimeMs = stat.mtimeMs
    textCache.text = normalized

    return normalized
  } catch {
    return 'TXT小说路径不存在或路径不正确'
  }
}

function makePage(text) {
  getStartEnd()
  updatePage()

  if (db.get('is_display_page')) {
    const pageInfo = `${bookState.curr_page_number}/${bookState.page}`
    return `${text.substring(bookState.start, bookState.end)}    ${pageInfo}`
  }

  return text.substring(bookState.start, bookState.end)
}

module.exports = {
  search(so) {
    init()
    const text = readFile()
    getSize(text)
    const soResult = []
    const re = new RegExp(so, 'g')
    let result = null

    do {
      try {
        result = re.exec(text)
        if (!result) {
          continue
        }

        const page = Math.ceil(result.index / bookState.page_size)
        const textx = text.substring(result.index - 30, result.index + 31)

        soResult.push({
          index: result.index,
          page,
          text: textx
        })
      } catch {
        result = null
      }
    } while (result !== null)

    return soResult
  },
  getPreviousPage() {
    init()
    const text = readFile()
    getSize(text)
    getPage('previous')
    return makePage(text)
  },
  getNextPage() {
    init()
    const text = readFile()
    getSize(text)
    getPage('next')
    return makePage(text)
  },
  getJumpingPage() {
    init()
    const text = readFile()
    getSize(text)
    getPage('curr')
    return makePage(text)
  }
}
