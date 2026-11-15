const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')

const app = require('../src/app')

let server
let baseUrl

before(async () => {
  server = await new Promise((resolve) => {
    const listeningServer = app.listen(0, () => resolve(listeningServer))
  })

  const { port } = server.address()
  baseUrl = `http://127.0.0.1:${port}`
})

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
})

test('GET /health returns an OK status', async () => {
  const response = await fetch(`${baseUrl}/health`)

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { status: 'ok' })
})
