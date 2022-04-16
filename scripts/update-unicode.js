import cp from 'child_process'
import fs from 'fs'
import glob from 'glob'

let maxUnicode = 0

const setMaxUnicode = () => {
  const path = 'src/_icons/*.svg'

  const files = glob.sync(path)

  files.forEach(function(file) {
    const svgFile = fs.readFileSync(file).toString()

    svgFile.replace(/unicode: "([a-f0-9.]+)"/i, function(m, unicode) {
      const newUnicode = parseInt(unicode, 16)

      if(newUnicode) {
        maxUnicode = Math.max(maxUnicode, newUnicode)
      }
    })
  })
}

const addUnicodeToIcons = (files) => {

  for (const i in files) {
    const file = files[i]

    if (fs.existsSync(`src/_icons/${file}.svg`)) {
      let svgFile = fs.readFileSync(`src/_icons/${file}.svg`).toString()

      if (!svgFile.match(/unicode: ([a-f0-9.]+)/i)) {
        maxUnicode++
        const unicode = maxUnicode.toString(16)

        if(unicode) {
          svgFile = svgFile.replace(/---\n<svg>/i, function(m) {
            return `unicode: "${unicode}"\n${m}`
          })

          console.log(`Add unicode "${unicode}" to "${file}"`);
          fs.writeFileSync(`src/_icons/${file}.svg`, svgFile)
        }
      } else {
        console.log(`File ${file} already has unicode`)
      }
    } else {
      console.log(`File ${file} doesn't exists`)
    }
  }
}

const updateIconsUnicode = () => {
  setMaxUnicode()

  cp.exec(`grep -RiL "unicode: " ./src/_icons/*.svg`, function(err, ret) {

    let newIcons = []

    ret.replace(/src\/_icons\/([a-z0-9-]+)\.svg/g, function(m, fileName) {
      newIcons.push(fileName)
    })

    if (newIcons.length) {
      console.log('newIcons', newIcons.join(', '));
      addUnicodeToIcons(newIcons)
    }
  })
}

updateIconsUnicode()
