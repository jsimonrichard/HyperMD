const path = require('path')
const express = require('express')
const buildCSS = require('./build-css')
const utils = require('./utils')

process.chdir(path.join(__dirname, ".."))

const app = express()
app.use(express.static(process.cwd()))
app.listen(8000, () => console.log('[HyperMD] http://127.0.0.1:8000 is now ready'))
import('open').then(({default: open}) => {
  async function opener() {
    await open('http://127.0.0.1:8000')
  }

  opener()
})

utils.npm_run("watch_js")
buildCSS.scan_and_compile("**/*.scss", true)
