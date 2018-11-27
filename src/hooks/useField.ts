import debounce from 'lodash.debounce';
import { useCallback, useMemo, useState } from 'react';
import useConnectedForm from './useConnectedForm';

export interface IFieldState {
  dirty: Set<string | number>;
  changing: Set<string | number>;
  focused: Set<string | number>;
  initialValue: any;
  touched: Set<string | number>;
  value: any;
}

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
type SetValueFn = (value: ((currentState: IFieldState) => any) | any) => void;

export interface IField<TError> {
  changing: boolean;
  dirty: boolean;
  error: TError;
  focused: boolean;
  initialValue: any;
  isDirty: IsDirtyFn;
  isFocused: IsFocusedFn;
  isTouched: IsTouchedFn;
  setChanging: SetChangingFn;
  setDirty: SetDirtyFn;
  setFocused: SetFocusFn;
  setValue: SetValueFn;
  touched: boolean;
  value: any;
  valid: boolean;
}

export interface IFieldSettings {
  debounceDelay?: number;
  enableReinitialize?: boolean;
  onChange?: OnChangeFn;
  onChangingChange?: OnChangingChangeFn;
  onDirtyChange?: OnDirtyChangeFn;
  onFocusChange?: OnFocusChangeFn;
}

const noop = () => undefined;

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
  }: IFieldSettings = {},
): IField<TError> {
  const form = useConnectedForm();
  const [state, setState] = useState({
    changing: new Set(),
    dirty: new Set(),
    focused: new Set(),
    initialValue,
    touched: new Set(),
    value: currentValue || initialValue,
  });
  const isDirty = useCallback((name = '') => state.dirty.has(name), [state.dirty]);
  const isFocused = useCallback((name = '') => state.focused.has(name), [state.focused]);
  const isTouched = useCallback((name = '') => state.touched.has(name), [state.touched]);
  const setDirty = useCallback(
    (dirtyState, name = '') =>
      setState(currentState => ({
        ...currentState,
        dirty: dirtyState
          ? addToSet(currentState.dirty, name)
          : removeFromSet(currentState.dirty, name),
      })),
    [true],
  );
  const setFocused = useCallback(
    (focusState, name = '') =>
      setState(currentState => ({
        ...currentState,
        focused: focusState
          ? addToSet(currentState.focused, name)
          : removeFromSet(currentState.focused, name),
        touched: addToSet(currentState.touched, name),
      })),
    [true],
  );
  const setChanging = useCallback(
    (changingState, name = '') =>
      setState(currentState => ({
        ...currentState,
        changing: changingState
          ? addToSet(currentState.changing, name)
          : removeFromSet(currentState.changing, name),
      })),
    [true],
  );
  const notifyChange = useMemo(
    () =>
      debounce(value => {
        onChange(value);
        setChanging(false);
      }, debounceDelay),
    [debounceDelay, onChange, setChanging],
  );
  const setValue = useCallback(
    newValue => {
      // ignore change if form is submitting/validating
      if (form.submitting || form.validating) {
        return;
      }

      // set value marks field as changing and sets it as not changing in debounced callback
      setState(currentState => {
        const value = typeof newValue === 'function' ? newValue(currentState) : newValue;

        // notify parent about the change
        notifyChange(value);

        return {
          ...currentState,
          changing: addToSet(currentState.changing, ''),
          dirty:
            value !== currentState.initialValue
              ? addToSet(currentState.dirty, '')
              : removeFromSet(currentState.dirty, ''),
          value,
        };
      });
    },
    [form.submitting, form.validating],
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
  const changing = useMemo(
    () => {
      const nonEmpty = state.changing.size > 0;

      onChangingChange(nonEmpty);

      return nonEmpty;
    },
    [state.changing],
  );
  // notify about dirty
  const dirty = useMemo(
    () => {
      const nonEmpty = state.dirty.size > 0;

      onDirtyChange(nonEmpty);

      return nonEmpty;
    },
    [state.dirty],
  );
  const focused = useMemo(
    () => {
      const nonEmpty = state.focused.size > 0;

      onFocusChange(nonEmpty);

      return nonEmpty;
    },
    [state.focused],
  );
  const touched = useMemo(() => state.touched.size > 0, [state.touched]);

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
    valid: error == null,
    value: state.value,
  };
}
