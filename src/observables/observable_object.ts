import {ObservableGetter, ObservableValue} from "./observable_value";
import { isPlainObject, isPropertyKey, stringifyKey} from "./utils";
import {ComputedValue} from "./computed";
import {MANAGER, nextId} from "./global_state";

class ObjectManager {
  readonly type = 'object' as const;
  readonly values: Map<PropertyKey, ObservableValue<any> | ComputedValue<any>> = new Map();

  constructor(
    public target: any,
    public name: string
  ) {
  }

  get(name: PropertyKey) {
    return this.values.get(name)?.get()
  }

  set(name: PropertyKey, value: any) {
    const o = this.values.get(name);
    (o as any).set(value);
  }

  has(name: PropertyKey) {
    // create an observable value for the key.
  }

  remove(name: PropertyKey) {

  }

  addExistingObservableProp(key: PropertyKey, value: ObservableValue<any> | ComputedValue<any>) {
    const instance = this.target
    this.values.set(key, value)
    Object.defineProperty(instance, key, {
      enumerable: true,
      configurable: true,
      get() {
        return this[MANAGER].get(key)
      },
      set(v) {
        this[MANAGER].set(key, v)
      }
    })
  }

  addObservableProp(key: PropertyKey, value: any) {
    const instance = this.target
    const observable = new ObservableValue(value)
    this.values.set(key, observable)
    Object.defineProperty(instance, key, {
      enumerable: true,
      configurable: true,
      get() {
        return this[MANAGER].get(key)
      },
      set(v) {
        this[MANAGER].set(key, v)
      }
    })
  }
}

type ObservableObject<T> = {
  [MANAGER]: ObjectManager
} & T

function getManager(target: ObservableObject<unknown>): ObjectManager {
  return target[MANAGER]
}

const proxyHandler: ProxyHandler<ObservableObject<any>> = {
  has(target: ObservableObject<any>, name: PropertyKey) {
    if (name === MANAGER || name === "constructor")
      return true
    // const manager = getManager(target)
    // if (isPropertyKey(name)) return manager.has(name)
    return (name as any) in target
  },
  get(target: ObservableObject<any>, name: PropertyKey): any {
    if (name === MANAGER || name === "constructor") {
      return target[name]
    }
    const manager = getManager(target)
    const observable = manager.values.get(name)
    if (observable instanceof ObservableValue || observable instanceof ComputedValue) {
      return observable.get()
    }
    if (isPropertyKey(name)) manager.has(name)
    return target[name]
  },
  set(target: object, name: PropertyKey, value: any): boolean {
    if (!isPropertyKey(name)) return false
    set(target, name, value)
    return true
  },
  deleteProperty(target: ObservableObject<any>, name: PropertyKey) {
    if (!isPropertyKey(name)) return false
    const manager = getManager(target)
    manager.remove(name)
    return true
  },
  ownKeys(target: ObservableObject<any>) {
    // const manager = getManager(target)
    // adm.keysAtom.reportObserved()
    return Reflect.ownKeys(target)
  },
  preventExtensions() {
    return false
  }
}

function createObjectAdmin(target: any, name: PropertyKey = ""): ObjectManager {
  if (target[MANAGER]) return target[MANAGER];
  if (!name) {
    if (isPlainObject(target)) {
      name = `ObservableObject@${nextId()}`
    } else {
      name = `${(target.constructor.name || "ObservableObject")}@${nextId()}`
    }
  }
  return new ObjectManager(target, stringifyKey(name));
}

function asAnObservableObject<T extends object>(target: T): ObservableObject<T> {
  const adm = createObjectAdmin(target);
  Object.defineProperty(target, MANAGER, {
    enumerable: false,
    writable: true,
    configurable: true,
    value: adm,
  })
  return target as ObservableObject<T>
}

function isManaged<T extends any>(v: T): v is ObservableObject<T> {
  return !!(v as any)[MANAGER]
}


function set(target: object, key: PropertyKey, value: any) {
  // console.log(target, key, value)
  if (!isManaged(target)) {
    return false;
  }
  const manager = getManager(target);
  const existing = manager.values.get(key);
  if (existing) {
    manager.set(key, value)
  } else {
    if (value instanceof ObservableValue) {
      target[MANAGER].addExistingObservableProp(key, value);
    } else if (value instanceof ComputedValue) {
      target[MANAGER].addExistingObservableProp(key, value);
    } else {
      target[MANAGER].addObservableProp(key, value)
    }
  }
}


type AsAccessor<T> = T extends ObservableGetter<any> ? ReturnType<T['get']> : T;

// TODO: figure out making computed values set only.
type WithPropsAsAccessors<T extends object> = { [K in keyof T]: AsAccessor<T[K]> }

export function observable<T extends object>(target: T): WithPropsAsAccessors<T> {
  const object = asAnObservableObject(target);
  const keys = Object.keys(object);
  for (const key of keys) {
    set(object, key, (object as Record<PropertyKey, any>)[key])
  }
  return new Proxy<ObservableObject<T>>(object, proxyHandler) as WithPropsAsAccessors<T>
}

