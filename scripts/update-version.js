import p from '../package.json'
import cp from 'child_process'
import fs from 'fs'
import { basename } from 'path'

const setVersionToIcons = (version, files) => {
  for (const i in files) {
    const file = files[i]

    if (fs.existsSync(`src/_icons/${file}.svg`)) {
      let svgFile = fs.readFileSync(`src/_icons/${file}.svg`).toString()

      if (!svgFile.match(/version: ([0-9.]+)/i)) {
        svgFile = svgFile.replace(/---\n<svg>/i, function(m) {
          return `version: "${version}"\n${m}`
        })

        console.log(`Set version to ${version} in "${basename(file)}"`);
        fs.writeFileSync(`src/_icons/${file}.svg`, svgFile)
      } else {
        console.log(`File ${file} already has version`)
      }
    } else {
      console.log(`File ${file} doesn't exists`)
    }
  }
}

const updateIconsVersion = (version) => {

  if (version) {
    cp.exec(`grep -RiL "version: " ./src/_icons/*.svg`, function(err, ret) {

      let newIcons = []

      ret.replace(/src\/_icons\/([a-z0-9-]+)\.svg/g, function(m, fileName) {
        newIcons.push(fileName)
      })

      if (newIcons.length) {
        setVersionToIcons(version.replace(/\.0$/, ''), newIcons)
      }
    })
  }
}

updateIconsVersion(p.version)
