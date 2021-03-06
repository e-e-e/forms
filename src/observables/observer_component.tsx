import React from 'react'
import { watch, watcher } from './observer'

function useForceUpdate() {
  const [, setTick] = React.useState(0)
  return React.useCallback(() => {
    setTick((tick) => tick + 1)
  }, [])
}

// TODO: handle unwatching when unmounted.
export function observer<T extends {}>(
  Comp: React.FunctionComponent<T>,
): React.FunctionComponent<T> {
  return React.memo<T>((props: T) => {
    const update = useForceUpdate()
    const subscription = React.useMemo(() => watcher(Comp, update), [update])
    React.useEffect(() => {
      return () => {
        subscription.unsubscribe()
      }
    }, [subscription])
    const Component = subscription.Component
    return <Component {...props} />
  })
}

export const Observer = React.memo(
  ({ children }: { children: () => React.ReactNode }) => {
    const update = useForceUpdate()
    const watchedChildren = React.useMemo(() => watch(children, update), [children, update])
    return <>{watchedChildren()}</>
  },
  () => true,
)
