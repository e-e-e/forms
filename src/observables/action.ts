import { globalState, runReactions } from './global_state'

function startBatch() {
  globalState.batchCounter++
}

function endBatch() {
  globalState.batchCounter--
  if (globalState.batchCounter === 0) {
    runReactions()
  }
}

export function action<T extends (...args: any) => any>(fn: T): T {
  return ((...args) => {
    startBatch()
    let error: any
    try {
      return fn(...args)
    } catch (e) {
      error = e
      console.error(e)
    } finally {
      endBatch()
    }
    throw error
  }) as T
}

export function runInAction(fn: () => void) {
  action(fn)()
}
