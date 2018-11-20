// @flow
/* eslint-disable no-plusplus */

import React, { Fragment } from 'react';
import { fireEvent, render, wait } from 'react-testing-library';
import useArrayField from '../useArrayField';

function Input({
  currentValue,
  enableReinitialize,
  initialValue,
  onChange,
}: {
  currentValue?: Array<any>,
  enableReinitialize?: boolean,
  initialValue?: Array<any>,
  onChange?: Function,
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
        onChange={(e: SyntheticInputEvent<HTMLInputElement>) =>
          field.setValue(JSON.parse(e.target.value))
        }
        type="text"
        value={JSON.stringify(field.value)}
      />
      <span data-testid="error">{JSON.stringify(field.error)}</span>
      <span data-testid="dirty">{field.dirty.toString()}</span>
      <span data-testid="changing">{field.changing.toString()}</span>
      <span data-testid="initialValue">{field.initialValue}</span>
      <span data-testid="focused">{field.focused.toString()}</span>
      <span data-testid="touched">{field.touched.toString()}</span>
      <span data-testid="valid">{field.valid.toString()}</span>
      <button
        data-testid="addItem"
        onClick={(e: any) => field.addItem(e.target.value)}
        type="button"
      >
        Add
      </button>
      <button
        data-testid="removeItem"
        onClick={(e: any) => field.removeItem(parseInt(e.target.value, 10))}
        type="button"
      >
        Remove
      </button>
      <button data-testid="removeLastItem" onClick={() => field.removeLastItem()} type="button">
        Remove
      </button>
      <button
        data-testid="setItem"
        onClick={(e: any) => field.setItem(parseInt(e.target.index, 10), e.target.value)}
        type="button"
      >
        Set
      </button>
    </Fragment>
  );
}

describe('useArrayField hook', () => {
  it('works corretly', async () => {
    const onChangeMock = jest.fn();
    const { getByTestId, rerender } = render(<Input enableReinitialize onChange={onChangeMock} />);

    expect(getByTestId('dirty').innerHTML).toBe('false');
    expect(getByTestId('changing').innerHTML).toBe('false');
    expect(getByTestId('initialValue').innerHTML).toBe('');
    expect(getByTestId('focused').innerHTML).toBe('false');
    expect(getByTestId('touched').innerHTML).toBe('false');

    // now touch it
    fireEvent.focus(getByTestId('input'));

    expect(getByTestId('focused').innerHTML).toBe('true');
    expect(getByTestId('touched').innerHTML).toBe('true');

    fireEvent.blur(getByTestId('input'));

    expect(getByTestId('focused').innerHTML).toBe('false');
    expect(getByTestId('touched').innerHTML).toBe('true');

    // change the value
    fireEvent.change(getByTestId('input'), { target: { value: '["A"]' } });
    fireEvent.change(getByTestId('input'), { target: { value: '["A", "B"]' } });
    fireEvent.change(getByTestId('input'), { target: { value: '["A","B","C"]' } });
    fireEvent.change(getByTestId('input'), { target: { value: '["A","B","C","D"]' } });
    // $FlowFixMe
    expect(getByTestId('input').value).toBe('["A","B","C","D"]');

    expect(getByTestId('changing').innerHTML).toBe('true');
    expect(getByTestId('dirty').innerHTML).toBe('true');

    await wait(() => {
      expect(getByTestId('changing').innerHTML).toBe('false');
    });

    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith(['A', 'B', 'C', 'D']);

    // now change initial value
    rerender(
      <Input enableReinitialize initialValue={['a', 'b', 'c', 'd']} onChange={onChangeMock} />,
    );

    expect(onChangeMock).toHaveBeenCalledTimes(2);
    expect(onChangeMock).toHaveBeenCalledWith(['a', 'b', 'c', 'd']);

    expect(getByTestId('dirty').innerHTML).toBe('false');
    // $FlowFixMe
    expect(getByTestId('input').value).toBe('["a","b","c","d"]');
    expect(getByTestId('initialValue').innerHTML).toBe('abcd');

    // add item
    fireEvent.click(getByTestId('addItem'), { target: { value: 'e' } });
    expect(getByTestId('changing').innerHTML).toBe('true');
    // $FlowFixMe
    expect(getByTestId('input').value).toBe('["a","b","c","d","e"]');

    await wait(() => {
      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(onChangeMock).toHaveBeenCalledTimes(3);
      expect(onChangeMock).toHaveBeenCalledWith(['a', 'b', 'c', 'd', 'e']);
    });

    // add item with value
    fireEvent.click(getByTestId('addItem'), { target: { value: 'f' } });
    expect(getByTestId('changing').innerHTML).toBe('true');
    // $FlowFixMe
    expect(getByTestId('input').value).toBe('["a","b","c","d","e","f"]');

    await wait(() => {
      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(onChangeMock).toHaveBeenCalledTimes(4);
      expect(onChangeMock).toHaveBeenCalledWith(['a', 'b', 'c', 'd', 'e', 'f']);
    });

    fireEvent.click(getByTestId('removeLastItem'));
    expect(getByTestId('changing').innerHTML).toBe('true');

    // $FlowFixMe
    expect(getByTestId('input').value).toBe('["a","b","c","d","e"]');

    fireEvent.click(getByTestId('removeItem'), { target: { value: 4 } });
    expect(getByTestId('changing').innerHTML).toBe('true');
    // $FlowFixMe
    expect(getByTestId('input').value).toBe('["a","b","c","d"]');
    fireEvent.click(getByTestId('removeItem'), { target: { value: 2 } });
    expect(getByTestId('changing').innerHTML).toBe('true');
    // $FlowFixMe
    expect(getByTestId('input').value).toBe('["a","b","d"]');

    await wait(() => {
      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(onChangeMock).toHaveBeenCalledTimes(5);
      expect(onChangeMock).toHaveBeenCalledWith(['a', 'b', 'd']);
    });

    fireEvent.click(getByTestId('setItem'), { target: { index: 6, value: 'added' } });
    expect(getByTestId('changing').innerHTML).toBe('true');
    // $FlowFixMe
    expect(getByTestId('input').value).toBe('["a","b","d",null,null,null,"added"]');

    await wait(() => {
      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(onChangeMock).toHaveBeenCalledTimes(6);
      expect(onChangeMock).toHaveBeenCalledWith([
        'a',
        'b',
        'd',
        undefined,
        undefined,
        undefined,
        'added',
      ]);
    });
  });
});
