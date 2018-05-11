const SKIP = '__skip'

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
  let updateCurrentHook = current => {
    if (current) {
      if (current === SKIP) {
        return SKIP
      }

      hookObj = current
    }
    return hookObj
  }

  const promise = hooks.reduce((promise, fn) => {
    const hook = fn.bind(this)

    if (hook.length === 2) {
      promise = promise.then(hookObj => hookObj === SKIP ? SKIP : new Promise((resolve, reject) => {
        hook(hookObj, res => {
          resolve(res)
        })
      }))
    } else {
      promise = promise.then(hookObj => hookObj === SKIP ? SKIP : hook(hookObj))
    }

    return promise.then(updateCurrentHook)
  }, Promise.resolve(obj))

  return promise.then(() => hookObj)
}

module.exports = function createApp () {
  const app = Object.create(application)

  app.init()

  return app
}
