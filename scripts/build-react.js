const glob = require('glob')
const path = require('path')
const fs = require('fs')
const { default: svgr } = require('@svgr/core')
const { asyncForEach, camelize } = require('./utils')

const packageDir = path.resolve(__dirname, '../packages/icons-react')

const optimizeSvgCode = function (svgCode) {
  return svgCode
  .replace('<path stroke="none" d="M0 0h24v24H0z" fill="none"/>', '')
}

const componentName = function (file) {
  file = path.basename(file, '.svg')
  file = camelize(`Icon ${file}`)

  return file
}

const buildReact = async () => {
  let files = glob.sync(`./dist/icons/*.svg`)

  let indexCode = '',
      indexDCode = `import { FC, SVGAttributes } from 'react';

interface TablerIconProps extends SVGAttributes<SVGElement> { color?: string; size?: string | number; stroke?: string | number; }

type TablerIcon = FC<TablerIconProps>;\n\n`

  await asyncForEach(files, async function (file) {
    const svgCode = optimizeSvgCode(fs.readFileSync(file).toString()),
        fileName = path.basename(file, '.svg') + '.js',
        iconComponentName = componentName(file)

    if(fs.existsSync(`${packageDir}/icons/`)) {
      fs.rmSync(`${packageDir}/icons/`, { recursive: true })
    }

    fs.mkdirSync(`${packageDir}/icons/`, { recursive: true })

    await svgr(svgCode, {
      icon: false,
      svgProps: { width: '{size}', height: '{size}', strokeWidth: '{stroke}', stroke: '{color}' },
      template: require('./svgr-template')
    }, { componentName: iconComponentName }).then(jsCode => {
      fs.writeFileSync(`${packageDir}/icons/${fileName}`, jsCode)

      indexCode += `export { default as ${iconComponentName} } from './icons/${fileName}';\n`
      indexDCode += `export const ${iconComponentName}: TablerIcon;\n`
    })

    fs.writeFileSync(`${packageDir}/index.js`, indexCode)
    fs.writeFileSync(`${packageDir}/index.d.ts`, indexDCode)
  })
}


buildReact()
