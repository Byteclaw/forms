// @flow

import debounce from 'lodash.debounce';
// $FlowFixMe
import { useCallback, useMemo, useState } from 'react';

export type FieldState = {
  dirty: Set<string | number>,
  changing: Set<string | number>,
  focused: Set<string | number>,
  initialValue: any,
  touched: Set<string | number>,
  value: any,
};

type IsDirtyFn = (name?: string | number) => boolean;
type IsFocusedFn = (name?: string | number) => boolean;
type IsTouchedFn = (name?: string | number) => boolean;
type OnChangeFn = (value: any) => any;
type OnChangingChangeFn = (changing: boolean) => any;
type OnFocusChangeFn = (focused: boolean) => any;
type OnDirtyChangeFn = (dirty: boolean) => any;
type SetChangingFn = (changing: boolean, childName?: string | number) => void;
type SetDirtyFn = (dirty: boolean, childName?: string | number) => void;
type SetFocusFn = (focused: boolean, childName?: string | number) => void;
type SetValueFn = (value: ((currentState: FieldState) => any) | any) => void;

export type Field<TError> = {
  changing: boolean,
  dirty: boolean,
  error: TError,
  focused: boolean,
  initialValue: any,
  isDirty: IsDirtyFn,
  isFocused: IsFocusedFn,
  isTouched: IsTouchedFn,
  setChanging: SetChangingFn,
  setDirty: SetDirtyFn,
  setFocused: SetFocusFn,
  setValue: SetValueFn,
  touched: boolean,
  value: any,
  valid: boolean,
};

export type FieldSettings = {
  debounceDelay?: number,
  enableReinitialize?: boolean,
  onChange?: OnChangeFn,
  onChangingChange?: OnChangingChangeFn,
  onDirtyChange?: OnDirtyChangeFn,
  onFocusChange?: OnFocusChangeFn,
};

const noop = () => {};

function addToSet<T>(set: Set<T>, value: T): Set<T> {
  if (set.has(value)) {
    return set;
  }

  return new Set([...set, value]);
}

function removeFromSet<T>(set: Set<T>, value: T): Set<T> {
  if (set.delete(value)) {
    return new Set(set);
  }

  return set;
}

export default function useField<TError>(
  currentValue: any,
  initialValue: any,
  error: TError,
  {
    debounceDelay = 300,
    enableReinitialize = true,
    onChange = noop,
    onChangingChange = noop,
    onDirtyChange = noop,
    onFocusChange = noop,
  }: FieldSettings = {},
): Field<TError> {
  const [state, setState]: [FieldState, Function] = useState({
    dirty: new Set(),
    changing: new Set(),
    focused: new Set(),
    initialValue,
    touched: new Set(),
    value: currentValue || initialValue,
  });
  const isDirty: IsDirtyFn = useCallback((name = '') => state.dirty.has(name), [state.dirty]);
  const isFocused: IsFocusedFn = useCallback((name = '') => state.focused.has(name), [
    state.focused,
  ]);
  const isTouched: IsTouchedFn = useCallback((name = '') => state.touched.has(name), [
    state.touched,
  ]);
  const setDirty: SetDirtyFn = useCallback(
    (dirty, name = '') =>
      setState(currentState => ({
        ...currentState,
        dirty: dirty ? addToSet(currentState.dirty, name) : removeFromSet(currentState.dirty, name),
      })),
    [true],
  );
  const setFocused: SetFocusFn = useCallback(
    (focused, name = '') =>
      setState(currentState => ({
        ...currentState,
        focused: focused
          ? addToSet(currentState.focused, name)
          : removeFromSet(currentState.focused, name),
        touched: addToSet(currentState.touched, name),
      })),
    [true],
  );
  const setChanging: SetChangingFn = useCallback(
    (changing, name = '') =>
      setState(currentState => ({
        ...currentState,
        changing: changing
          ? addToSet(currentState.changing, name)
          : removeFromSet(currentState.changing, name),
      })),
    [true],
  );
  const notifyChange: OnChangeFn = useMemo(
    () =>
      debounce(value => {
        onChange(value);
        setChanging(false);
      }, debounceDelay),
    [debounceDelay, onChange, setChanging],
  );
  const setValue: SetValueFn = useCallback(
    newValue => {
      // set value marks field as changing and sets it as not changing in debounced callback
      setState(currentState => {
        const value = typeof newValue === 'function' ? newValue(currentState) : newValue;

        // notify parent about the change
        notifyChange(value);

        return {
          ...currentState,
          dirty:
            value !== currentState.initialValue
              ? addToSet(currentState.dirty, '')
              : removeFromSet(currentState.dirty, ''),
          changing: addToSet(currentState.changing, ''),
          value,
        };
      });
    },
    [true],
  );

  // change initial value if it has changed
  // reinitialize value too but only if value has changed
  if (initialValue !== state.initialValue) {
    setState(currentState => {
      const newState = {
        ...currentState,
        dirty: enableReinitialize
          ? removeFromSet(currentState.dirty, '')
          : initialValue !== currentState.value
            ? addToSet(currentState.dirty, '')
            : removeFromSet(currentState.dirty, ''),
        initialValue,
        value: enableReinitialize ? initialValue : currentState.value,
      };

      if (enableReinitialize) {
        onChange(newState.value);
      }

      return newState;
    });
  }

  // notify about changing on change
  const changing: boolean = useMemo(
    () => {
      const isChanging = state.changing.size > 0;

      onChangingChange(isChanging);

      return isChanging;
    },
    [state.changing],
  );
  // notify about dirty
  const dirty: boolean = useMemo(
    () => {
      const _isDirty = state.dirty.size > 0;

      onDirtyChange(_isDirty);

      return _isDirty;
    },
    [state.dirty],
  );
  const focused: boolean = useMemo(
    () => {
      const _isFocused = state.focused.size > 0;

      onFocusChange(_isFocused);

      return _isFocused;
    },
    [state.focused],
  );
  const touched: boolean = useMemo(() => state.touched.size > 0, [state.touched]);

  return {
    changing,
    dirty,
    error,
    focused,
    initialValue: state.initialValue,
    isDirty,
    isFocused,
    isTouched,
    setChanging,
    setDirty,
    setFocused,
    setValue,
    touched,
    value: state.value,
    valid: error == null,
  };
}
