// @ts-ignore
import type { models as rawModels } from "@@/plugin-model/model"
import isEqual from "fast-deep-equal"
import React, { useContext, useEffect, useMemo, useRef, useState } from "react"

type Models = typeof rawModels

type GetNamespaces<M> = {
  [K in keyof M]: M[K] extends { namespace: string } ? M[K]["namespace"] : never
}[keyof M]

type Namespaces = GetNamespaces<Models>

// @ts-ignore
const Context = React.createContext<{ dispatcher: Dispatcher }>(null)

class Dispatcher {
  callbacks: Record<Namespaces, Set<Function>> = {}
  data: Record<Namespaces, unknown> = {}
  update = (namespace: Namespaces) => {
    if (this.callbacks[namespace]) {
      this.callbacks[namespace].forEach((cb) => {
        try {
          const data = this.data[namespace]
          cb(data)
        } catch (e) {
          cb(undefined)
        }
      })
    }
  }
}

interface ExecutorProps {
  hook: () => any
  onUpdate: (val: any) => void
  namespace: string
}

function Executor(props: ExecutorProps) {
  const { hook, onUpdate, namespace } = props

  const updateRef = useRef(onUpdate)
  const initialLoad = useRef(false)

  let data: any
  try {
    data = hook()
  } catch (e) {
    console.error(`plugin-model: Invoking '${namespace || "unknown"}' model failed:`, e)
  }

  useMemo(() => {
    updateRef.current(data)
  }, [])

  useEffect(() => {
    if (initialLoad.current) {
      updateRef.current(data)
    } else {
      initialLoad.current = true
    }
  })

  return null
}

const dispatcher = new Dispatcher()

export function Provider(props: { models: Record<string, any>; children: React.ReactNode }) {
  return (
    <Context.Provider value={{ dispatcher }}>
      {Object.keys(props.models).map((namespace) => {
        return (
          <Executor
            key={namespace}
            hook={props.models[namespace]}
            namespace={namespace}
            onUpdate={(val) => {
              dispatcher.data[namespace] = val
              dispatcher.update(namespace)
            }}
          />
        )
      })}
      {props.children}
    </Context.Provider>
  )
}

type GetModelByNamespace<M, N> = {
  [K in keyof M]: M[K] extends { namespace: string; model: unknown }
    ? M[K]["namespace"] extends N
      ? M[K]["model"] extends (...args: any) => any
        ? ReturnType<M[K]["model"]>
        : never
      : never
    : never
}[keyof M]

type Model<N> = GetModelByNamespace<Models, N>
type Selector<N, S> = (model: Model<N>) => S

type SelectedModel<N, T> = T extends (...args: any) => any ? ReturnType<NonNullable<T>> : Model<N>

export function useModel<N extends Namespaces>(namespace: N): Model<N>

export function useModel<N extends Namespaces, S>(namespace: N, selector: Selector<N, S>): SelectedModel<N, typeof selector>

export function useModel<N extends Namespaces, S>(namespace: N, selector?: Selector<N, S>): SelectedModel<N, typeof selector> {
  const { dispatcher } = useContext<{ dispatcher: Dispatcher }>(Context)
  const selectorRef = useRef(selector)
  selectorRef.current = selector
  const [state, setState] = useState(() => (selectorRef.current ? selectorRef.current(dispatcher.data[namespace]) : dispatcher.data[namespace]))
  const stateRef = useRef<any>(state)
  stateRef.current = state

  const isMount = useRef(false)
  useEffect(() => {
    isMount.current = true
    return () => {
      isMount.current = false
    }
  }, [])

  useEffect(() => {
    const handler = (data: any) => {
      if (!isMount.current) {
        setTimeout(() => {
          dispatcher.data[namespace] = data
          dispatcher.update(namespace)
        })
      } else {
        const currentState = selectorRef.current ? selectorRef.current(data) : data
        const previousState = stateRef.current
        if (!isEqual(currentState, previousState)) {
          stateRef.current = currentState
          setState(currentState)
        }
      }
    }

    dispatcher.callbacks[namespace] ||= new Set() as any
    dispatcher.callbacks[namespace].add(handler)
    dispatcher.update(namespace)

    return () => {
      dispatcher.callbacks[namespace].delete(handler)
    }
  }, [namespace])

  return state
}
