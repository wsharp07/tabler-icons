#!/usr/bin/env node

import glob from 'glob'
import path from 'path'
import fs from 'fs'
import svgr from '@svgr/core'
import { asyncForEach, camelize, optimizeSvgCode } from './utils'

const packageDir = path.resolve(__dirname, '../packages/icons-react')

const componentTemplate = function template(
    { template },
    opts,
    { imports, componentName, props, jsx, exports },
) {
  return template.ast`
    ${imports}
    function ${componentName}({ size = 24, color = "currentColor", stroke = 2, ...props }) { return (${jsx}); }
    ${exports}
  `;
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

    fs.mkdirSync(`${packageDir}/icons/`, { recursive: true })

    await svgr(svgCode, {
      icon: false,
      svgProps: { width: '{size}', height: '{size}', strokeWidth: '{stroke}', stroke: '{color}' },
      template: componentTemplate
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
