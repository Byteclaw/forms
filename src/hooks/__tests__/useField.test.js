// @flow
/* eslint-disable no-plusplus */

import React, { Fragment } from 'react';
import { fireEvent, render, wait } from 'react-testing-library';
import useField from '../useField';

function Input({
  currentValue,
  initialValue,
  onChange,
  onChangingChange,
  onFocusChange,
}: {
  currentValue?: any,
  initialValue?: any,
  onChange?: Function,
  onChangingChange?: Function,
  onFocusChange?: Function,
}) {
  const field = useField(currentValue, initialValue, undefined, {
    debounceDelay: 2,
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
        onChange={(e: SyntheticInputEvent<HTMLInputElement>) => field.setValue(e.target.value)}
        type="text"
        value={field.value}
      />
      <span data-testid="dirty">{field.dirty.toString()}</span>
      <span data-testid="changing">{field.changing.toString()}</span>
      <span data-testid="initialValue">{field.initialValue}</span>
      <span data-testid="focused">{field.focused.toString()}</span>
      <span data-testid="touched">{field.touched.toString()}</span>
    </Fragment>
  );
}

describe('useField hook', () => {
  it('works corretly', async () => {
    const onChangeMock = jest.fn();
    const onChangingChangeMock = jest.fn();
    const onFocusChangeMock = jest.fn();
    const { getByTestId, rerender } = render(
      <Input
        onChange={onChangeMock}
        onChangingChange={onChangingChangeMock}
        onFocusChange={onFocusChangeMock}
      />,
    );

    expect(onFocusChangeMock).toHaveBeenCalledTimes(1);
    expect(onFocusChangeMock).toHaveBeenCalledWith(false);
    expect(onChangingChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangingChangeMock).toHaveBeenCalledWith(false);

    expect(getByTestId('dirty').innerHTML).toBe('false');
    expect(getByTestId('changing').innerHTML).toBe('false');
    expect(getByTestId('initialValue').innerHTML).toBe('');
    expect(getByTestId('focused').innerHTML).toBe('false');
    expect(getByTestId('touched').innerHTML).toBe('false');

    // now touch it
    fireEvent.focus(getByTestId('input'));

    expect(getByTestId('focused').innerHTML).toBe('true');
    expect(getByTestId('touched').innerHTML).toBe('true');
    expect(onFocusChangeMock).toHaveBeenCalledTimes(2);
    expect(onFocusChangeMock).toHaveBeenCalledWith(true);

    fireEvent.blur(getByTestId('input'));

    expect(getByTestId('focused').innerHTML).toBe('false');
    expect(getByTestId('touched').innerHTML).toBe('true');
    expect(onFocusChangeMock).toHaveBeenCalledTimes(3);
    expect(onFocusChangeMock).toHaveBeenCalledWith(false);

    // change the value
    fireEvent.change(getByTestId('input'), { target: { value: 'A' } });
    expect(onChangingChangeMock).toHaveBeenCalledTimes(2);
    expect(onChangingChangeMock).toHaveBeenCalledWith(true);
    fireEvent.change(getByTestId('input'), { target: { value: 'AB' } });
    fireEvent.change(getByTestId('input'), { target: { value: 'ABC' } });
    fireEvent.change(getByTestId('input'), { target: { value: 'ABCD' } });
    // $FlowFixMe
    expect(getByTestId('input').value).toBe('ABCD');

    expect(getByTestId('changing').innerHTML).toBe('true');
    expect(getByTestId('dirty').innerHTML).toBe('true');

    await wait(() => {
      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(onChangingChangeMock).toHaveBeenCalledTimes(3);
      expect(onChangingChangeMock).toHaveBeenCalledWith(false);
    });

    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith('ABCD');

    // now change initial value
    rerender(<Input initialValue="test-value" onChange={onChangeMock} />);

    expect(getByTestId('dirty').innerHTML).toBe('false');
    // $FlowFixMe
    expect(getByTestId('input').value).toBe('test-value');
    expect(getByTestId('initialValue').innerHTML).toBe('test-value');
  });
});
