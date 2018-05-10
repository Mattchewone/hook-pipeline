const application = {
  init () {
    // Some initial data which will be passed through the chain
    Object.assign(this, {
      data: undefined,
      info: [],
      warning: [],
      error: []
    })
    // Set up the hooks
    initialiseHooks.call(this, this)
  }
}

function initialiseHooks (app) {
  if (typeof app.process === 'function') {
    return
  }

  // Predefined hooks
  const __hooks = {
    process: []
  }

  Object.defineProperty(app, '__hooks', {
    value: __hooks
  })

  Object.assign(app, {
    process (hooks) {
      const curHook = this.__hooks.process
      curHook.push.apply(curHook, hooks)
      return this
    },

    run (data) {
      if (!data) {
        return
      }
      // Set the data
      app.data = data
      // Get the initial process hooks
      const hooks = app.__hooks.process

      return processHooks.call(app, hooks, app)
        .catch(error => {
          app.error.push({ type: 'error', message: error })
          return Promise.resolve(app)
        })
    }
  })
}

function processHooks (hooks, obj) {
  let hookObj = obj

  const promise = hooks.reduce((promise, fn) => {
    const hook = fn.bind(this)

    if (hook.length === 2) {
      promise = promise.then(hookObj => new Promise(resolve => {
        hook(hookObj, res => {
          resolve(res)
        })
      }))
    } else {
      promise = promise.then(hookObj => hook(hookObj))
    }

    return promise.then(obj => { return obj ? (hookObj = obj) : hookObj })
  }, Promise.resolve(obj))

  return promise.then(() => hookObj)
}

module.exports = function createApp () {
  const app = Object.create(application)

  app.init()

  return app
}
