export function isPropertyKey(val: any): val is PropertyKey {
  return typeof val === 'string' || typeof val === 'number' || typeof val === 'symbol'
}

export function isString(v: any): v is string {
  return typeof v === 'string'
}

export function isNumber(v: any): v is number {
  return typeof v === 'number'
}

export function isObject(value: any): value is Object {
  return value !== null && typeof value === 'object'
}

export function isPlainObject(value: any): value is Object {
  if (!isObject(value)) return false
  const proto = Object.getPrototypeOf(value)
  if (proto == null) return true
  return proto.constructor?.toString() === Object.toString()
}

export function stringifyKey(key: any): string {
  if (typeof key === 'string') return key
  if (typeof key === 'symbol') return key.toString()
  return new String(key).toString()
}
