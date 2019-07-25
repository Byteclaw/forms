import { act, fireEvent, render } from '@testing-library/react';
// @ts-ignore
import React, { ConcurrentMode, Fragment, SyntheticEvent, unstable_ConcurrentMode } from 'react';
import { useField } from '../useField';
import { FormContext } from '../formContext';

const Concurrent = unstable_ConcurrentMode || ConcurrentMode;

function Input({
  enableReinitialize,
  initialValue,
  onChange,
  onChangingChange,
  onFocusChange,
}: {
  enableReinitialize?: boolean;
  initialValue?: any;
  onChange?: () => any;
  onChangingChange?: () => any;
  onFocusChange?: () => any;
}) {
  const field = useField(undefined, initialValue, undefined, {
    debounceDelay: 2,
    enableReinitialize,
    onChange,
    onChangingChange,
    onFocusChange,
  });

  return (
    <Fragment>
      <input
        data-testid="input"
        onBlur={() => field.setFocused(false)}
        onFocus={() => field.setFocused(true)}
        onChange={(e: SyntheticEvent<HTMLInputElement>) => field.setValue(e.currentTarget.value)}
        type="text"
        value={field.value || ''}
      />
      <span data-testid="dirty">{field.dirty.toString()}</span>
      <span data-testid="changing">{field.changing.toString()}</span>
      <span data-testid="initialValue">{field.initialValue}</span>
      <span data-testid="focused">{field.focused.toString()}</span>
      <span data-testid="touched">{field.touched.toString()}</span>
    </Fragment>
  );
}

describe.each([['Sync mode', 'div'], ['Concurrent mode', Concurrent]])(
  'useField hook (%s)',
  (_, Container) => {
    it('works correctly', () => {
      const onChangeMock = jest.fn();
      const onChangingChangeMock = jest.fn();
      const onFocusChangeMock = jest.fn();
      const { getByTestId, rerender } = render(
        <Container>
          <Input
            enableReinitialize
            onChange={onChangeMock}
            onChangingChange={onChangingChangeMock}
            onFocusChange={onFocusChangeMock}
          />
        </Container>,
      );

      expect(onFocusChangeMock).toHaveBeenCalledTimes(0);
      expect(onChangingChangeMock).toHaveBeenCalledTimes(0);

      expect(getByTestId('dirty').innerHTML).toBe('false');
      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(getByTestId('initialValue').innerHTML).toBe('');
      expect(getByTestId('focused').innerHTML).toBe('false');
      expect(getByTestId('touched').innerHTML).toBe('false');

      // now touch it
      fireEvent.focus(getByTestId('input'));

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('focused').innerHTML).toBe('true');
      expect(getByTestId('touched').innerHTML).toBe('true');
      expect(onFocusChangeMock).toHaveBeenLastCalledWith(true);

      fireEvent.blur(getByTestId('input'));

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('touched').innerHTML).toBe('true');
      expect(getByTestId('focused').innerHTML).toBe('false');
      expect(onFocusChangeMock).toHaveBeenLastCalledWith(false);

      // change the value
      fireEvent.change(getByTestId('input'), { target: { value: 'A' } });

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(onChangingChangeMock).toHaveBeenLastCalledWith(true);

      fireEvent.change(getByTestId('input'), { target: { value: 'AB' } });
      fireEvent.change(getByTestId('input'), { target: { value: 'ABC' } });
      fireEvent.change(getByTestId('input'), { target: { value: 'ABCD' } });

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect((getByTestId('input') as HTMLInputElement).value).toBe('ABCD');
      expect(getByTestId('changing').innerHTML).toBe('true');
      expect(getByTestId('dirty').innerHTML).toBe('true');

      // resolve debounce
      act(() => jest.runAllTimers());
      // flush changes
      act(() => jest.runAllTimers());

      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(onChangingChangeMock).toHaveBeenLastCalledWith(false);
      expect(onChangeMock).toHaveBeenLastCalledWith('ABCD', expect.any(Function));

      // now change initial value
      rerender(
        <Container>
          <Input enableReinitialize initialValue="test-value" onChange={onChangeMock} />
        </Container>,
      );

      // perform work
      act(() => jest.runAllTimers());
      // flush changes because otherwise we will see the previous render result
      // need to switch to alternate
      act(() => jest.runAllTimers());

      expect(onChangeMock).toHaveBeenLastCalledWith('test-value', expect.any(Function));
      expect((getByTestId('input') as HTMLInputElement).value).toBe('test-value');
      expect(getByTestId('dirty').innerHTML).toBe('false');

      // now make form validating and try to change a value
      rerender(
        <FormContext.Provider
          value={{ errors: {}, submitting: false, valid: true, validating: true } as any}
        >
          <Container>
            <Input
              enableReinitialize
              initialValue="test-value"
              onChange={onChangeMock}
              onChangingChange={onChangingChangeMock}
              onFocusChange={onFocusChangeMock}
            />
          </Container>
        </FormContext.Provider>,
      );

      // perform work
      act(() => jest.runAllTimers());
      act(() => jest.runAllTimers());

      fireEvent.change(getByTestId('input'), { target: { value: 'AB' } });

      // resolve debounce
      act(() => jest.runAllTimers());
      // flush changes
      act(() => jest.runAllTimers());

      expect(onChangeMock).not.toHaveBeenLastCalledWith('AB', expect.any(Function));
      expect((getByTestId('input') as HTMLInputElement).value).toBe('test-value');

      // now make form submitting and try to change a value
      rerender(
        <FormContext.Provider
          value={{ errors: {}, submitting: true, valid: true, validating: false } as any}
        >
          <Container>
            <Input
              initialValue="test-value"
              onChange={onChangeMock}
              onChangingChange={onChangingChangeMock}
              onFocusChange={onFocusChangeMock}
            />
          </Container>
        </FormContext.Provider>,
      );

      // perform work
      act(() => jest.runAllTimers());
      act(() => jest.runAllTimers());

      fireEvent.change(getByTestId('input'), { target: { value: 'AB' } });

      // resolve debounce
      act(() => jest.runAllTimers());
      // flush changes
      act(() => jest.runAllTimers());

      expect(onChangeMock).not.toHaveBeenLastCalledWith('AB', expect.any(Function));
      expect((getByTestId('input') as HTMLInputElement).value).toBe('test-value');
    });

    it('cancels debounced changes if is unmounted (issue #9)', () => {
      const onChange = jest.fn();
      const { getByTestId, rerender, unmount } = render(
        <Container>
          <Input onChange={onChange} />
        </Container>,
      );

      const onChangingChange = jest.fn(() => setTimeout(unmount, 0));

      rerender(
        <Container>
          <Input onChange={onChange} onChangingChange={onChangingChange} />
        </Container>,
      );

      // now change the value (change is debounced)
      fireEvent.change(getByTestId('input'), { target: { value: 'aaaa' } });

      act(() => jest.runTimersToTime(0));
      expect(onChangingChange).toHaveBeenCalledTimes(1);
      act(() => jest.runTimersToTime(0));

      // now resolve debounce
      act(() => jest.runAllTimers());

      expect(onChange).not.toHaveBeenCalled();
    });
  },
);
