'use strict'
const copy = require('recursive-copy')
const path = require('path')

const reactScriptName = 'build'

const copyStaticFilesWithoutHtml = () => {
  return copy('build', path.join(__dirname, '../public', reactScriptName), {
    filter: ['**/*', '!index.html'],
    overwrite: true
  })
    .then(function (results) {
      console.info('Copied ' + results.length + ' files')
    })
    .catch(function (error) {
      console.error('Copy failed: ' + error)
    })
}

const copyHtmlToResources = () => {
  return copy('build', path.join(__dirname, '../resources/views'), {
    filter: ['index.html'],
    overwrite: true,
    rename: function (filePath) {
      return 'react.edge'
    }
  })
    .then(function (results) {
      console.info('Copied ' + results.length + ' files')
    })
    .catch(function (error) {
      console.error('Copy failed: ' + error)
    })
}

copyStaticFilesWithoutHtml()
copyHtmlToResources()
