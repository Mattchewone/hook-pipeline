const pipeline = require('./index')

test('runs the pipeline', async () => {
  const fn = jest.fn()
  await pipeline()
    .process([
      fn
    ])
    .run({ name: 'Matt' })

  expect(fn.mock.calls.length).toBe(1)
})

test('does nothing with no hooks', async () => {
  const data = { name: 'Matt' }
  const output = await pipeline()
    .run(data)

  expect(output.data).toEqual(data)
})

test('can modify the data through the chain', async () => {
  const fn = jest.fn(arg => {
    arg.data.name = 'Bob'
    return arg
  })
  const fn1 = jest.fn()
  const output = await pipeline()
    .process([
      fn,
      fn1
    ])
    .run({ name: 'Matt' })

  expect(fn.mock.calls.length).toBe(1)
  expect(fn1.mock.calls.length).toBe(1)

  expect(fn1.mock.calls[0][0].data.name).toEqual('Bob')
  expect(output.data.name).toEqual('Bob')
})
