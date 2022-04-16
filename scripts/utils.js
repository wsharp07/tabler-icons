export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}


export const camelize = function (str) {
  str = str.replace(/-/g, ' ')

  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
    return word.toUpperCase()
  }).replace(/\s+/g, '')
}
