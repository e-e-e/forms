import {observer} from "../observer";
import {runInAction} from "../action";
import {ObservableValue} from "../observable_value";
import {computed} from "../computed";
import {observable} from "../observable_object";
import {Simulate} from "react-dom/test-utils";

describe('Computed', () => {
  it('is observed', () => {
    const spy = jest.fn();
    const a = new ObservableValue(1)
    const b = new ObservableValue(2)
    const c = computed(() => a.get() + b.get());
    observer(() => {
      spy(c.get());
    });
    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith(3)
    runInAction(() => a.set(2))
    expect(spy).toBeCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith(4)
  })

  it('only evaluates when called', () => {
    const computerSpy = jest.fn();
    const a = new ObservableValue(1)
    const b = new ObservableValue(2)
    const c = computed(() => {
      computerSpy();
      return a.get() + b.get()
    });
    expect(computerSpy).toBeCalledTimes(0)
    expect(c.get()).toEqual(3)
    expect(computerSpy).toBeCalledTimes(1)
  })

  it('only does not recalculate if observed values have not changed', () => {
    const computerSpy = jest.fn();
    const a = new ObservableValue(1)
    const b = new ObservableValue(2)
    const c = computed(() => {
      computerSpy();
      return a.get() + b.get()
    });
    expect(computerSpy).toBeCalledTimes(0)
    expect(c.get()).toEqual(3)
    expect(computerSpy).toBeCalledTimes(1)
    expect(c.get()).toEqual(3)
    expect(computerSpy).toBeCalledTimes(1)
  })

  it('recalculates when an observed value changes', () => {
    const computerSpy = jest.fn();
    const a = new ObservableValue(1)
    const b = new ObservableValue(2)
    const c = computed(() => {
      computerSpy();
      return a.get() + b.get()
    });
    expect(computerSpy).toBeCalledTimes(0)
    expect(c.get()).toEqual(3)
    expect(computerSpy).toBeCalledTimes(1)
    runInAction(() => a.set(0))
    expect(c.get()).toEqual(2)
    expect(computerSpy).toBeCalledTimes(2)
  })

  it('only recalculates once when multiple observed values change', () => {
    const spy = jest.fn();
    const a = new ObservableValue(1)
    const b = new ObservableValue(2)
    const c = computed(() => {
      spy();
      return a.get() + b.get()
    });
    expect(spy).toBeCalledTimes(0)
    expect(c.get()).toEqual(3)
    expect(spy).toBeCalledTimes(1)
    runInAction(() => {
      a.set(0)
      b.set(0)
    })
    expect(c.get()).toEqual(0)
    expect(spy).toBeCalledTimes(2)
  })

  it('observes other computed values', () => {
    const spy = jest.fn();
    const a = new ObservableValue(1)
    const twiceA = computed(() => a.get() * 2)
    const twiceAPlus2 = computed(() => {
      spy();
      return twiceA.get() + 2
    });
    expect(spy).toBeCalledTimes(0)
    expect(twiceAPlus2.get()).toEqual(4)
    expect(spy).toBeCalledTimes(1)
    runInAction(() => {
      a.set(0)
    })
    expect(twiceAPlus2.get()).toEqual(2)
    expect(spy).toBeCalledTimes(2)
  })

  it('', () => {
    const o =  observable({ foo: 'bar'})
    const oplus = computed(() => {
      return { o, other: `${o.foo}+` }
    })
    expect(oplus.get().other).toEqual( 'bar+' )
    runInAction(() => {
      oplus.get().o.foo = 'new'
      // o.foo = 'new'
    })
    expect(oplus.get().other).toEqual('new+' )

  })
})
