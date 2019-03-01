import debounce from 'lodash.debounce';
import { useCallback, useMemo, useReducer, useRef, Dispatch, Reducer } from 'react';
import useConnectedForm from './useConnectedForm';
import { fieldReducer, FieldActionType, FieldAction, FieldState } from './fieldReducer';
import { useMountedTracker } from './useMountedTracker';

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
type OnChangeFn<TDispatch = Dispatch<any>> = (value: any, dispatch: TDispatch) => any;
type OnChangingChangeFn = (changing: boolean) => any;
type OnFocusChangeFn = (focused: boolean) => any;
type OnDirtyChangeFn = (dirty: boolean) => any;
type SetChangingFn = (changing: boolean, childName?: string | number) => void;
type SetDirtyFn = (dirty: boolean, childName?: string | number) => void;
type SetFocusFn = (focused: boolean, childName?: string | number) => void;
type SetValueFn = (value: ((currentState: IFieldState) => any) | any) => void;

export interface IField<TActions = FieldAction, TValue = any> {
  changing: boolean;
  dirty: boolean;
  dispatch: Dispatch<TActions>;
  errors: { [key: string]: string } | string | undefined;
  enableReinitialize: boolean;
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
  value: TValue;
  valid: boolean;
}

export interface IFieldSettings<
  TFieldState extends FieldState = FieldState,
  TFieldActions = FieldAction
> {
  debounceDelay?: number;
  enableReinitialize?: boolean;
  initialState?: TFieldState;
  onChange?: OnChangeFn<Dispatch<TFieldActions>>;
  onChangingChange?: OnChangingChangeFn;
  onDirtyChange?: OnDirtyChangeFn;
  onFocusChange?: OnFocusChangeFn;
  /**
   * This is used to propagate change to parent if the initialValues of Object/Array field has changed
   * But the underlying scalar value for this field hasn't (edge case)
   */
  parentInitialValue?: any;
  reducer?: Reducer<TFieldState, TFieldActions>;
}

const noop = () => undefined;

export default function useField<
  TFieldState extends FieldState = FieldState,
  TFieldActions = FieldAction
>(
  currentValue: any,
  initialValue: any,
  error: string | { [key: string]: string } | undefined,
  {
    debounceDelay = 300,
    enableReinitialize = true,
    initialState,
    onChange = noop,
    onChangingChange = noop,
    onDirtyChange = noop,
    onFocusChange = noop,
    parentInitialValue,
    reducer,
  }: IFieldSettings<TFieldState, TFieldActions> = {},
): IField<TFieldActions> {
  const form = useConnectedForm();
  const mounted = useMountedTracker();
  const stateTracker = useRef({
    previousParentInitialValue: parentInitialValue,
    lastValue: initialState ? initialState.initialValue : currentValue || initialValue,
    changing: false,
    dirty: false,
    focused: false,
  });
  const [state, dispatch] = useReducer(
    reducer || fieldReducer,
    initialState || {
      changing: new Set<string>(),
      dirty: new Set<string>(),
      focused: new Set<string>(),
      initialValue,
      touched: new Set<string>(),
      value: currentValue || initialValue,
    },
  );
  const isDirty = useCallback((name = '') => state.dirty.has(name), [state.dirty]);
  const isFocused = useCallback((name = '') => state.focused.has(name), [state.focused]);
  const isTouched = useCallback((name = '') => state.touched.has(name), [state.touched]);
  const setDirty = useCallback(
    (isDirty: boolean, name: string = '') =>
      dispatch({ type: FieldActionType.SET_DIRTY, isDirty, name }),
    [dispatch],
  );
  const setFocused = useCallback(
    (isFocused: boolean, name: string = '') =>
      dispatch({
        type: FieldActionType.SET_FOCUS,
        isFocused,
        name,
      }),
    [dispatch],
  );
  const setChanging = useCallback(
    (isChanging: boolean, name: string = '') =>
      dispatch({
        type: FieldActionType.SET_CHANGING,
        isChanging,
        name,
      }),
    [dispatch],
  );
  const notifyChange = useMemo(() => {
    return debounce(value => {
      if (!mounted.current) {
        return;
      }

      onChange(value, dispatch);
      setChanging(false);
    }, debounceDelay);
  }, [debounceDelay, dispatch, onChange, setChanging, mounted]);

  const setValue = useCallback(
    newValue => {
      // ignore change if form is submitting/validating
      if (form.submitting || form.validating) {
        return;
      }

      setChanging(true);
      dispatch({ type: FieldActionType.SET_VALUE, name: '', value: newValue });
      notifyChange(newValue);
    },
    [form, dispatch, setChanging, notifyChange],
  );
  const changing = state.changing.size > 0;
  const dirty = state.dirty.size > 0;
  const focused = state.focused.size > 0;
  const touched = state.touched.size > 0;

  if (changing !== stateTracker.current.changing) {
    stateTracker.current.changing = changing;
    onChangingChange(changing);
  }

  if (focused !== stateTracker.current.focused) {
    stateTracker.current.focused = focused;
    onFocusChange(focused);
  }

  if (dirty !== stateTracker.current.dirty) {
    stateTracker.current.dirty = dirty;
    onDirtyChange(dirty);
  }

  if (state.value !== stateTracker.current.lastValue) {
    stateTracker.current.lastValue = state.value;

    notifyChange(state.value);
  }

  // propagate change to parent if parent's initial value has changed and current value of this field
  // is different than it's initial value
  // this solves the case when user changes some field in object field
  // then reinitializes the form with other field's initial values different except the on he changed
  // the value of form should be initial values + his change in current field
  if (
    parentInitialValue !== stateTracker.current.previousParentInitialValue &&
    state.value !== state.initialValue
  ) {
    stateTracker.current.previousParentInitialValue = parentInitialValue;
    // parent's (object, array) value has changed (so initial and value is changed)
    // make sure we propagate the change on this field again so we are sure
    // that value on parent for this child is consistent
    onChange(state.value, dispatch);
  }

  // change initial value if it has changed
  if (initialValue !== state.initialValue) {
    dispatch({ type: FieldActionType.SET_INITIAL_VALUE, name: '', value: initialValue });

    if (enableReinitialize) {
      // during reinitialize we need to cancel previous debounced changes
      // force as not changing
      // rewrite last value so we are not firing debounced change again
      // and fire onChange imperatively
      stateTracker.current.lastValue = initialValue;

      // cancel previous debounced on change
      notifyChange.cancel();

      // force as not changing
      setChanging(false);

      dispatch({ type: FieldActionType.SET_VALUE, name: '', value: initialValue });
      onChange(initialValue, dispatch);
    }
  }

  return {
    // form sets errors in it's state, so we need to allow local error to be overriden
    errors: error,
    ...state,
    enableReinitialize,
    changing,
    dirty,
    dispatch,
    focused,
    isDirty,
    isFocused,
    isTouched,
    setChanging,
    setDirty,
    setFocused,
    setValue,
    touched,
    valid: error == null,
  };
}
