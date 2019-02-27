// @ts-ignore
import React, { ConcurrentMode, Fragment, SyntheticEvent, unstable_ConcurrentMode } from 'react';
import { act, fireEvent, render } from 'react-testing-library';
import useObjectField from '../useObjectField';

const Concurrent = unstable_ConcurrentMode || ConcurrentMode;

function Input({
  currentValue,
  initialValue,
  enableReinitialize,
  onChange,
}: {
  currentValue?: { [key: string]: any };
  initialValue?: { [key: string]: any };
  enableReinitialize?: boolean;
  onChange?: () => any;
}) {
  const field = useObjectField(
    currentValue,
    initialValue,
    {},
    {
      debounceDelay: 2,
      enableReinitialize,
      onChange,
    },
  );

  return (
    <Fragment>
      <input
        data-testid="input"
        onBlur={() => field.setFocused(false)}
        onFocus={() => field.setFocused(true)}
        onChange={(e: SyntheticEvent<HTMLInputElement>) =>
          field.setValue(JSON.parse(e.currentTarget.value))
        }
        type="text"
        value={JSON.stringify(field.value)}
      />
      <span data-testid="dirty">{field.dirty.toString()}</span>
      <span data-testid="changing">{field.changing.toString()}</span>
      <span data-testid="initialValue">{JSON.stringify(field.initialValue)}</span>
      <span data-testid="focused">{field.focused.toString()}</span>
      <span data-testid="touched">{field.touched.toString()}</span>
      <button
        data-testid="setField"
        onClick={(e: SyntheticEvent<HTMLButtonElement>) =>
          field.setField((e.currentTarget as any).field, e.currentTarget.value)
        }
        type="button"
      >
        Set
      </button>
    </Fragment>
  );
}

describe.each([['Sync mode', 'div'], ['Concurrent mode', Concurrent]])(
  'useObjectField hook (%s)',
  (_, Container) => {
    it('works corretly', () => {
      const onChangeMock = jest.fn();
      const { getByTestId, rerender } = render(
        <Container>
          <Input enableReinitialize onChange={onChangeMock} />
        </Container>,
      );

      expect(getByTestId('dirty').innerHTML).toBe('false');
      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(getByTestId('initialValue').innerHTML).toBe('{}');
      expect(getByTestId('focused').innerHTML).toBe('false');
      expect(getByTestId('touched').innerHTML).toBe('false');

      // now touch it
      fireEvent.focus(getByTestId('input'));

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('focused').innerHTML).toBe('true');
      expect(getByTestId('touched').innerHTML).toBe('true');

      fireEvent.blur(getByTestId('input'));

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('focused').innerHTML).toBe('false');
      expect(getByTestId('touched').innerHTML).toBe('true');

      // change the value
      fireEvent.change(getByTestId('input'), { target: { value: '{"a":1}' } });
      fireEvent.change(getByTestId('input'), { target: { value: '{"a":1,"b":2}' } });

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect((getByTestId('input') as HTMLInputElement).value).toBe('{"a":1,"b":2}');
      expect(getByTestId('changing').innerHTML).toBe('true');
      expect(getByTestId('dirty').innerHTML).toBe('true');

      // resolve debounce
      act(() => jest.runAllTimers());

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(onChangeMock).toHaveBeenLastCalledWith({ a: 1, b: 2 }, expect.any(Function));

      // now change initial value
      rerender(
        <Container>
          <Input enableReinitialize initialValue={{ a: 2, b: 1, c: 3 }} onChange={onChangeMock} />
        </Container>,
      );

      expect(onChangeMock).toHaveBeenLastCalledWith({ a: 2, b: 1, c: 3 }, expect.any(Function));

      // flush changes
      act(() => jest.runAllTimers());
      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('dirty').innerHTML).toBe('false');
      expect((getByTestId('input') as HTMLInputElement).value).toBe('{"a":2,"b":1,"c":3}');
      expect(getByTestId('initialValue').innerHTML).toBe('{"a":2,"b":1,"c":3}');

      // set field
      fireEvent.click(getByTestId('setField'), { target: { field: 'd', value: '4' } });

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('changing').innerHTML).toBe('true');
      expect((getByTestId('input') as HTMLInputElement).value).toBe('{"a":2,"b":1,"c":3,"d":"4"}');

      // resolve debounce
      act(() => jest.runAllTimers());

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(onChangeMock).toHaveBeenLastCalledWith(
        { a: 2, b: 1, c: 3, d: '4' },
        expect.any(Function),
      );

      // set field
      fireEvent.click(getByTestId('setField'), { target: { field: 'a', value: '4' } });

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('changing').innerHTML).toBe('true');
      expect((getByTestId('input') as HTMLInputElement).value).toBe(
        '{"a":"4","b":1,"c":3,"d":"4"}',
      );

      // resolve debounce
      act(() => jest.runAllTimers());

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(onChangeMock).toHaveBeenLastCalledWith(
        { a: '4', b: 1, c: 3, d: '4' },
        expect.any(Function),
      );
    });
  },
);
