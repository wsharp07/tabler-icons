import svgpath from 'svgpath'
import svgParse from 'parse-svg-path'
import glob from 'glob'
import fs from 'fs'
import { basename } from 'path'

const addFloats = (n1, n2) => {
  return Math.round((parseFloat(n1) + parseFloat(n2)) * 1000) / 1000
}

const optimizePath = (path) => {
  let transformed = svgpath(path)
  .rel()
  .round(3)
  .toString()

  return svgParse(transformed).map(function (a) {
    return a.join(' ')
  }).join(' ')
}

const optimizeIcons = (path) => {
  glob(path, {}, function(er, files) {

    files.forEach(function(file) {
      let svgFile = fs.readFileSync(file),
          svgFileContent = svgFile.toString()

      svgFileContent = svgFileContent.replace(/><\/(polyline|line|rect|circle|path)>/g, '/>').
          replace(/rx="([^"]+)"\s+ry="\1"/g, 'rx="$1"').
          replace(/\s?\/>/g, ' />').
          replace(/\n\s*<(line|circle|path|polyline|rect)/g, "\n  <$1").
          replace(/polyline points="([0-9.]+)\s([0-9.]+)\s([0-9.]+)\s([0-9.]+)"/g, 'line x1="$1" y1="$2" x2="$3" y2="$4"').
          replace(/<path d="([^"]+)"/g, function(f, r1) {
            r1 = optimizePath(r1)

            return `<path d="${r1}"`
          }).
          replace(/d="m/g, 'd="M').
          replace(/([Aa])\s?([0-9.]+)\s([0-9.]+)\s([0-9.]+)\s?([0-1])\s?([0-1])\s?(-?[0-9.]+)\s?(-?[0-9.]+)/gi, '$1$2 $3 $4 $5 $6 $7 $8').
          replace(/\n\n+/g, "\n").
          replace(/<path d="M([0-9.]*) ([0-9.]*)l\s?([-0-9.]*) ([-0-9.]*)"/g, function(f, r1, r2, r3, r4) {
            return `<line x1="${r1}" y1="${r2}" x2="${addFloats(r1, r3)}" y2="${addFloats(r2, r4)}"`
          }).
          replace(/<path d="M([0-9.]*) ([0-9.]*)v\s?([-0-9.]*)"/g, function(f, r1, r2, r3) {
            return `<line x1="${r1}" y1="${r2}" x2="${r1}" y2="${addFloats(r2, r3)}"`
          }).
          replace(/<path d="M([0-9.]*) ([0-9.]*)h\s?([-0-9.]*)"/g, function(f, r1, r2, r3) {
            return `<line x1="${r1}" y1="${r2}" x2="${addFloats(r1, r3)}" y2="${r2}"`
          }).
          replace(/<path d="([^"]+)"/g, function(f, r1) {
            r1 = r1.replace(/ -0\./g, " -.").replace(/ 0\./g, " .").replace(/\s([a-z])/gi, "$1").replace(/([a-z])\s/gi, "$1")
            return `<path d="${r1}"`
          })

      if (svgFile.toString() !== svgFileContent) {
        console.log(`Optimize icon "${basename(file)}"`);
        fs.writeFileSync(file, svgFileContent)
      }
    })
  })
}

optimizeIcons("src/_icons/*.svg")
