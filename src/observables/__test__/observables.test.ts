import { observer } from '../observer'
import { ObservableValue } from '../observable_value'
import { runInAction } from '../action'
import { observable } from '../observable_object'
import { computed } from '../computed'
import { createObservableArray } from '../observable_array'

describe('observer', () => {
  it('does not rerun when value is changed outside an action', () => {
    const spy = jest.fn()
    const item = new ObservableValue('a')
    observer(() => {
      spy(item.get())
    })
    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith('a')
    item.set('b')
    expect(spy).toBeCalledTimes(1)
    expect(item.get()).toEqual('b')
  })

  it('does not rerun when value the same', () => {
    const spy = jest.fn()
    const item = new ObservableValue('a')
    observer(() => {
      spy(item.get())
    })
    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith('a')
    runInAction(() => item.set('a'))
    expect(spy).toBeCalledTimes(1)
    expect(item.get()).toEqual('a')
  })

  // TODO: MAKE THIS WORK
  it.skip('does not rerun when value the same after an action', () => {
    const spy = jest.fn()
    const item = new ObservableValue('a')
    observer(() => {
      spy(item.get())
    })
    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith('a')
    runInAction(() => {
      item.set('b')
      item.set('a')
    })
    expect(spy).toBeCalledTimes(1)
    expect(item.get()).toEqual('a')
  })

  it('reruns when single value is changed within an action.', () => {
    const spy = jest.fn()
    const item = new ObservableValue('a')
    observer(() => {
      spy(item.get())
    })
    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith('a')
    runInAction(() => item.set('b'))
    expect(spy).toBeCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith('b')
  })

  it('reruns only once when two values are updated within a singular action', () => {
    const spy = jest.fn()
    const itemA = new ObservableValue('a')
    const itemB = new ObservableValue(1)
    observer(() => {
      spy(itemA.get(), itemB.get())
    })
    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith('a', 1)
    runInAction(() => {
      itemA.set('b')
      itemB.set(2)
    })
    expect(spy).toBeCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith('b', 2)
  })

  it('subscribes to observables in subsequent reruns', () => {
    const spy = jest.fn()
    const itemA = new ObservableValue('first')
    const itemB = new ObservableValue('not observed to start')
    observer(() => {
      if (itemA.get() === 'second') {
        spy(itemA.get(), itemB.get())
        return
      }
      spy(itemA.get())
    })
    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith('first')
    runInAction(() => itemB.set('unnoticed'))
    expect(spy).toBeCalledTimes(1)
    runInAction(() => itemA.set('second'))
    expect(spy).toBeCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith('second', 'unnoticed')
    runInAction(() => itemB.set('now'))
    expect(spy).toBeCalledTimes(3)
    expect(spy).toHaveBeenLastCalledWith('second', 'now')
  })
})

describe('Observable Object', () => {
  it('reruns when an observable is changed within an action.', () => {
    const spy = jest.fn()
    const item = observable({ foo: 'bar' })
    observer(() => {
      spy(item.foo)
    })
    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith('bar')
    runInAction(() => (item.foo = 'foo'))
    expect(spy).toBeCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith('foo')
  })

  it('reruns when a value that was added to an observable is changed within an action.', () => {
    const spy = jest.fn()
    const item = observable<Record<string, any>>({ foo: 'bar' })
    item.bar = 'ok'
    observer(() => {
      spy(item.bar)
    })
    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith('ok')
    runInAction(() => (item.bar = 'foo'))
    expect(spy).toBeCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith('foo')
  })

  it('transforms properties that are ObservableValues into a standard property accessor', () => {
    const source = new ObservableValue(0)
    const o = observable({
      timesTwo: computed(() => source.get() * 2),
      source,
    })
    runInAction(() => {
      o.source = 2
    })
    expect(o.timesTwo).toEqual(4)
  })
})

describe('Observable Array', () => {
  it('reruns when an observable is changed within an action.', () => {
    const spy = jest.fn()
    const item = createObservableArray(['a', 'b', 'c'])
    observer(() => {
      spy(item[1])
    })
    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith('b')
    runInAction(() => (item[1] = 'b2'))
    expect(spy).toBeCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith('b2')
  })

  it('reruns when mapping over items and new value is added', () => {
    const spy = jest.fn()
    const item = createObservableArray(['a', 'b', 'c'])
    observer(() => {
      item.map((i) => i)
      spy()
    })
    expect(spy).toBeCalledTimes(1)
    runInAction(() => item.push('b2'))
    expect(spy).toBeCalledTimes(2)
  })
})
