# Hook Pipelines

## Pipeline processing shamelessly based off [Feathers](https://github.com/feathersjs/feathers)

Working example:
```js
const pipeline = require('hook-pipeline')

// Initialise
const output = await pipeline()
  // Run jobs here
  .process([
    context => {
      if (context.data[0].name === 'Matt') {
        context.error.push(new Error('Name === Matt'))
      }
      return context
    },

    context => {
      return request.get('http://example.com')  
        .then(res => {
          context.data[0].name = res.name
          return context
        })
    }
  ])
  .run({ name: 'Matt' })

// output contains data which has been processed and any errors you may have pushed into the hook context
// output.data === { name: 'Matt' }
// output.error === [{ new Error('msg') }]
```