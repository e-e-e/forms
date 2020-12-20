import {globalState, popExecutionContext, pushExecutionContext} from "./global_state";
import {ObservableAtom} from "./observable_atom";

export class Reaction {
  private pending = false;
  private observables: ObservableAtom[] = []

  constructor(private readonly fn: () => void) {
  }

  private schedule = () => {
    if (!this.pending) {
      globalState.pendingReactions.push(this);
    }
    this.pending = true;
  }

  runReaction = () => {
    pushExecutionContext();
    this.fn();
    this.pending = false
    const context = popExecutionContext();
    const observed = context?.observables ?? [];
    this.observables.forEach((o) => o.removeListener(this.schedule))
    observed.forEach(o => o.attachListener(this.schedule))
    this.observables = observed;
  }
}

export function observer(fn: () => void) {
  const reaction = new Reaction(fn);
  reaction.runReaction()
}

export class Watcher<T extends (...args: any) => any> {
  private pending = false;
  private observables: ObservableAtom[] = []
  private handlers = new Set<() => void>()

  constructor(private readonly fn: T) {
  }

  private schedule = () => {
    if (!this.pending) {
      globalState.pendingReactions.push(this);
    }
    this.pending = true;
  }

  addListener(action: () => void) {
    this.handlers.add(action)
  }

  getAction(): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
      pushExecutionContext();
      try {
        const v = this.fn(...args)
        const context = popExecutionContext();
        const observed = context?.observables ?? [];
        // this.observables.forEach((o) => o.removeListener(this.schedule))
        observed.forEach(o => o.attachListener(this.schedule))
        // this.observables = observed;
        return v;
      } catch (e) {
        console.error(e)
        throw e;
      }

    }) as T
  }

  runReaction = () => {
    this.handlers.forEach((handler) => handler())
    this.pending = false
  }
}


export function watch<T extends (...args: any) => any>(fn: T, reaction: () => void): T {
  console.log('created a watcher')
  const watcher = new Watcher(fn)
  watcher.addListener(reaction)
  return watcher.getAction()
}
