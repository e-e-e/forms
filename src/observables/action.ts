import {globalState, runReactions} from "./global_state";


function startBatch() {
  globalState.batchCounter++
}

function endBatch() {
  globalState.batchCounter--;
  if (globalState.batchCounter === 0) {
    runReactions();
  }
}

export function action(fn: () => void) {
  return () => runInAction(fn)
}

export function runInAction(fn: () => void) {
    startBatch();
    try {
      fn()
    } catch (e) {
      console.error(e)
    } finally {
      endBatch();
    }
}
