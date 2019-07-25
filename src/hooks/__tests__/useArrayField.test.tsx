import { act, fireEvent, render } from '@testing-library/react';
// @ts-ignore
import React, { ConcurrentMode, Fragment, SyntheticEvent, unstable_ConcurrentMode } from 'react';
import useArrayField from '../useArrayField';

const Concurrent = unstable_ConcurrentMode || ConcurrentMode;

function Input({
  currentValue,
  enableReinitialize,
  initialValue,
  onChange,
}: {
  currentValue?: any[];
  enableReinitialize?: boolean;
  initialValue?: any[];
  onChange?: () => any;
}) {
  const field = useArrayField(
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
      <span data-testid="initialValue">{field.initialValue}</span>
      <span data-testid="focused">{field.focused.toString()}</span>
      <span data-testid="touched">{field.touched.toString()}</span>
      <span data-testid="valid">{field.valid.toString()}</span>
      <button
        data-testid="addItem"
        onClick={(e: SyntheticEvent<HTMLButtonElement>) => {
          field.addItem(e.currentTarget.value);
        }}
        type="button"
      >
        Add
      </button>
      <button
        data-testid="removeItem"
        onClick={(e: SyntheticEvent<HTMLButtonElement>) =>
          field.removeItem(parseInt(e.currentTarget.value, 10))
        }
        type="button"
      >
        Remove
      </button>
      <button data-testid="removeLastItem" onClick={() => field.removeLastItem()} type="button">
        Remove
      </button>
      <button
        data-testid="setItem"
        onClick={(e: SyntheticEvent<HTMLButtonElement>) =>
          field.setItem(parseInt((e.currentTarget as any).index, 10), e.currentTarget.value)
        }
        type="button"
      >
        Set
      </button>
    </Fragment>
  );
}

describe.each([['Sync mode', 'div'], ['Concurrent mode', Concurrent]])(
  'useArrayField hook (%s)',
  (_, Container) => {
    it('works correctly', () => {
      const onChangeMock = jest.fn();
      const { getByTestId, rerender } = render(
        <Container>
          <Input enableReinitialize onChange={onChangeMock} />
        </Container>,
      );

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

      fireEvent.blur(getByTestId('input'));

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('focused').innerHTML).toBe('false');
      expect(getByTestId('touched').innerHTML).toBe('true');

      // change the value
      fireEvent.change(getByTestId('input'), { target: { value: '["A"]' } });
      fireEvent.change(getByTestId('input'), { target: { value: '["A", "B"]' } });
      fireEvent.change(getByTestId('input'), { target: { value: '["A","B","C"]' } });
      fireEvent.change(getByTestId('input'), { target: { value: '["A","B","C","D"]' } });

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect((getByTestId('input') as HTMLInputElement).value).toBe('["A","B","C","D"]');

      expect(getByTestId('changing').innerHTML).toBe('true');
      expect(getByTestId('dirty').innerHTML).toBe('true');

      // resolve input debounce
      act(() => jest.runTimersToTime(2));

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('changing').innerHTML).toBe('false');

      expect(onChangeMock).toHaveBeenLastCalledWith(['A', 'B', 'C', 'D'], expect.any(Function));

      // now change initial value
      rerender(
        <Container>
          <Input enableReinitialize initialValue={['a', 'b', 'c', 'd']} onChange={onChangeMock} />
        </Container>,
      );

      expect(onChangeMock).toHaveBeenLastCalledWith(['a', 'b', 'c', 'd'], expect.any(Function));

      // flush changes
      act(() => jest.runAllTimers());
      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('dirty').innerHTML).toBe('false');
      expect((getByTestId('input') as HTMLInputElement).value).toBe('["a","b","c","d"]');
      expect(getByTestId('initialValue').innerHTML).toBe('abcd');

      // add item
      fireEvent.click(getByTestId('addItem'), { target: { value: 'e' } });

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('changing').innerHTML).toBe('true');

      // resolve debounce
      act(() => jest.runAllTimers());

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect((getByTestId('input') as HTMLInputElement).value).toBe('["a","b","c","d","e"]');
      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(onChangeMock).toHaveBeenLastCalledWith(
        ['a', 'b', 'c', 'd', 'e'],
        expect.any(Function),
      );

      // add item with value
      fireEvent.click(getByTestId('addItem'), { target: { value: 'f' } });

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('changing').innerHTML).toBe('true');
      expect((getByTestId('input') as HTMLInputElement).value).toBe('["a","b","c","d","e","f"]');

      // resolve debounce
      act(() => jest.runAllTimers());

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(onChangeMock).toHaveBeenLastCalledWith(
        ['a', 'b', 'c', 'd', 'e', 'f'],
        expect.any(Function),
      );

      fireEvent.click(getByTestId('removeLastItem'));

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('changing').innerHTML).toBe('true');
      expect((getByTestId('input') as HTMLInputElement).value).toBe('["a","b","c","d","e"]');

      fireEvent.click(getByTestId('removeItem'), { target: { value: 4 } });

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('changing').innerHTML).toBe('true');
      expect((getByTestId('input') as HTMLInputElement).value).toBe('["a","b","c","d"]');

      fireEvent.click(getByTestId('removeItem'), { target: { value: 2 } });

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('changing').innerHTML).toBe('true');
      expect((getByTestId('input') as HTMLInputElement).value).toBe('["a","b","d"]');

      // resolve debounce
      act(() => jest.runAllTimers());

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(onChangeMock).toHaveBeenLastCalledWith(['a', 'b', 'd'], expect.any(Function));

      fireEvent.click(getByTestId('setItem'), { target: { index: 6, value: 'added' } });

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('changing').innerHTML).toBe('true');
      expect((getByTestId('input') as HTMLInputElement).value).toBe(
        '["a","b","d",null,null,null,"added"]',
      );

      // resolve debounce
      act(() => jest.runAllTimers());

      // flush changes
      act(() => jest.runTimersToTime(0));

      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(onChangeMock).toHaveBeenLastCalledWith(
        ['a', 'b', 'd', undefined, undefined, undefined, 'added'],
        expect.any(Function),
      );
    });

    it('removes initial value and adds empty (issue #11)', () => {
      const onChangeMock = jest.fn();
      const { getByTestId } = render(
        <Container>
          <Input initialValue={['a', 'b']} onChange={onChangeMock} />
        </Container>,
      );

      expect(getByTestId('dirty').innerHTML).toBe('false');
      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(getByTestId('initialValue').innerHTML).toBe('ab');
      expect((getByTestId('input') as HTMLInputElement).value).toBe('["a","b"]');
      expect(getByTestId('focused').innerHTML).toBe('false');
      expect(getByTestId('touched').innerHTML).toBe('false');

      // remove the last item
      fireEvent.click(getByTestId('removeItem'), { target: { value: 1 } });

      // resolve debounce
      act(() => jest.runAllTimers());

      expect((getByTestId('input') as HTMLInputElement).value).toBe('["a"]');

      // now add empty item
      fireEvent.click(getByTestId('addItem'), { target: {} });

      // resolve debounce
      act(() => jest.runAllTimers());

      expect((getByTestId('input') as HTMLInputElement).value).toBe('["a",""]');
    });
  },
);
