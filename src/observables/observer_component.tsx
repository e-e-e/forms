import React from 'react'
import { watch } from './observer'

function useForceUpdate() {
  const [, setTick] = React.useState(0)
  return React.useCallback(() => {
    setTick((tick) => tick + 1)
  }, [])
}

// TODO: handle unwatching when unmounted.
export function observer<T extends {}>(
  Component: React.FunctionComponent<T>,
): React.FunctionComponent<T> {
  return React.memo<T>((props: T) => {
    const update = useForceUpdate()
    const ObservableComponent = React.useMemo(() => watch(Component, update), [update])
    return <ObservableComponent {...props} />
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
