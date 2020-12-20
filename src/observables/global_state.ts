import {DerivationState} from "./derivation";
import {ObservableAtom} from "./observable_atom";

export const MANAGER = Symbol('adm')

let objectCounter = 0;

export function nextId() {
  return objectCounter++
}

type Reaction = {
  runReaction(): void
}
export function reportObserved(observable: ObservableAtom) {
  if (globalState.currentDerivation.length < 1) {
    // console.warn('Accessing observable outside of observable context')
    return;
  }
  const derivation = globalState.currentDerivation[globalState.currentDerivation.length - 1];
  derivation.observables.push(observable)
  // console.log('d---', derivation.observables)
}

export function pushExecutionContext() {
  globalState.currentDerivation.push({ observables: [] })
}

export function popExecutionContext() {
  return globalState.currentDerivation.pop()
}

type GlobalState = {
  batchCounter: number
  currentDerivation: DerivationState[]
  pendingReactions: Reaction[]
}

export const globalState: GlobalState = {
  batchCounter: 0,
  currentDerivation: [],
  pendingReactions: [],
}

const MAX_ITERATIONS = 100
export function runReactions() {
  const reactions = globalState.pendingReactions
  let iterations = 0
  while (reactions.length > 0) {
    iterations++
    if (iterations > MAX_ITERATIONS) {
      console.error('REACTIONS DANGEROUSLY LOOPING')
      reactions.splice(0);
    }
    const remaining = reactions.splice(0);
    for (const reaction of remaining) {
      reaction.runReaction();
    }
  }
}
