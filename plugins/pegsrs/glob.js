import nodeGlob from 'glob'

export default function glob(path, options = {}) {
  return new Promise((resolve, reject) =>
    nodeGlob(path, options, (err, files) => {
      if (err) {
        return reject(err)
      }
      resolve(files)
    })
  )
}
