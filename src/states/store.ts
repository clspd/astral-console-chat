import { useSyncExternalStore } from 'react';

type Listener = () => void;
type AnyFn = (...args: any[]) => any;

export type StoreApi<S extends object> = {
    getState: () => S;
    setState: (updater: (prev: S) => S) => void;
    patch: (partial: Partial<S>) => void;
    subscribe: (listener: Listener) => () => void;
};

export type StoreInstance<
    S extends object,
    A extends Record<string, AnyFn>,
> = S &
    A &
    StoreApi<S> & {
        use: <T>(selector: (store: StoreInstance<S, A>) => T) => T;
    };

export type StoreDefinition<
    S extends object,
    A extends Record<string, AnyFn> = {}
> = {
    state: () => S;
    actions?: A & ThisType<StoreInstance<S, A>>;
};

const Store = Object.create(null);
Store[Symbol.toStringTag] = () => 'Store';

export function createStore<
    S extends object,
    A extends Record<string, AnyFn> = {}
>(def: StoreDefinition<S, A>): StoreInstance<S, A> {
    const initialState = def.state();
    let state = initialState;
    const listeners = new Set<Listener>();

    const setState: StoreApi<S>['setState'] = (updater) => {
        const next = updater(state);
        if (Object.is(next, state)) return;
        state = next;
        listeners.forEach((fn) => fn());
    };

    const subscribe: StoreApi<S>['subscribe'] = (listener) => {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    };

    const patch: StoreApi<S>['patch'] = (partial) => {
        setState((prev) => ({ ...prev, ...partial }));
    };

    const store = Object.create(Store) as StoreInstance<S, A>;
    
    Object.defineProperties(store, {
        getState: { value: () => state, enumerable: false },
        setState: { value: setState, enumerable: false },
        patch: { value: patch, enumerable: false },
        subscribe: { value: subscribe, enumerable: false },
        use: {
            value: <T,>(selector: (s: StoreInstance<S, A>) => T) =>
                useSyncExternalStore(
                    subscribe,
                    () => selector(store),
                    () => selector(store),
                ),
            enumerable: false,
        },
    });

    for (const key of Object.keys(initialState) as (keyof S)[]) {
        Object.defineProperty(store, key, {
            enumerable: true,
            get: () => state[key],
            set: (value: S[typeof key]) => {
                setState((prev) => ({ ...prev, [key]: value } as S));
            },
        });
    }

    const actions = def.actions ?? {};
    for (const [name, fn] of Object.entries(actions) as [string, AnyFn][]) {
        Object.defineProperty(store, name, {
            enumerable: true,
            value: (...args: unknown[]) => fn.apply(store, args),
        });
    }

    return store;
}

