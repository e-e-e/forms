import { reportObserved } from "./global_state";

type ListenerFn = () => void;

export class ObservableAtom {
  protected readonly listeners = new Set<ListenerFn>();

  attachListener(fn: ListenerFn) {
    this.listeners.add(fn)
  }

  removeListener(fn: ListenerFn) {
    this.listeners.delete(fn);
  }

  protected reportObserved() {
    reportObserved(this)
  }

  protected emitChanged() {
    for (let listener of this.listeners.values()) {
      listener();
    }
  }
}
