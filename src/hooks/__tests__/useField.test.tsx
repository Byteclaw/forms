// tslint:disable:jsx-no-lambda
import React, { Fragment, SyntheticEvent } from 'react';
import { fireEvent, render, wait } from 'react-testing-library';
import { FormContext } from '../formContext';
import useField from '../useField';
import { Form } from '../useForm';

function Input({
  currentValue,
  initialValue,
  onChange,
  onChangingChange,
  onFocusChange,
}: {
  currentValue?: any;
  initialValue?: any;
  onChange?: () => any;
  onChangingChange?: () => any;
  onFocusChange?: () => any;
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
        onChange={(e: SyntheticEvent<HTMLInputElement>) => field.setValue(e.currentTarget.value)}
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
      <FormContext.Provider
        value={{ errors: {}, submitting: false, valid: true, validating: false } as any}
      >
        <Input
          onChange={onChangeMock}
          onChangingChange={onChangingChangeMock}
          onFocusChange={onFocusChangeMock}
        />
      </FormContext.Provider>,
    );

    expect(onFocusChangeMock).toHaveBeenCalledTimes(1);
    expect(onFocusChangeMock).toHaveBeenLastCalledWith(false);
    expect(onChangingChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangingChangeMock).toHaveBeenLastCalledWith(false);

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
    expect(onFocusChangeMock).toHaveBeenLastCalledWith(true);

    fireEvent.blur(getByTestId('input'));

    expect(getByTestId('focused').innerHTML).toBe('false');
    expect(getByTestId('touched').innerHTML).toBe('true');
    expect(onFocusChangeMock).toHaveBeenCalledTimes(3);
    expect(onFocusChangeMock).toHaveBeenLastCalledWith(false);

    // change the value
    fireEvent.change(getByTestId('input'), { target: { value: 'A' } });
    expect(onChangingChangeMock).toHaveBeenCalledTimes(2);
    expect(onChangingChangeMock).toHaveBeenLastCalledWith(true);
    fireEvent.change(getByTestId('input'), { target: { value: 'AB' } });
    fireEvent.change(getByTestId('input'), { target: { value: 'ABC' } });
    fireEvent.change(getByTestId('input'), { target: { value: 'ABCD' } });
    expect((getByTestId('input') as HTMLInputElement).value).toBe('ABCD');

    expect(getByTestId('changing').innerHTML).toBe('true');
    expect(getByTestId('dirty').innerHTML).toBe('true');

    await wait(() => {
      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(onChangingChangeMock).toHaveBeenCalledTimes(3);
      expect(onChangingChangeMock).toHaveBeenLastCalledWith(false);
    });

    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenLastCalledWith('ABCD');

    // now change initial value
    rerender(
      <FormContext.Provider
        value={{ errors: {}, submitting: false, valid: true, validating: false } as any}
      >
        <Input
          initialValue="test-value"
          onChange={onChangeMock}
          onChangingChange={onChangingChangeMock}
          onFocusChange={onFocusChangeMock}
        />
      </FormContext.Provider>,
    );

    expect(onChangeMock).toHaveBeenCalledTimes(2);
    expect(onChangeMock).toHaveBeenLastCalledWith('test-value');
    expect(getByTestId('dirty').innerHTML).toBe('false');
    expect((getByTestId('input') as HTMLInputElement).value).toBe('test-value');

    // now make form validating and try to change a value
    rerender(
      <FormContext.Provider
        value={{ errors: {}, submitting: false, valid: true, validating: true } as any}
      >
        <Input
          initialValue="test-value"
          onChange={onChangeMock}
          onChangingChange={onChangingChangeMock}
          onFocusChange={onFocusChangeMock}
        />
      </FormContext.Provider>,
    );

    fireEvent.change(getByTestId('input'), { target: { value: 'AB' } });

    expect(onChangeMock).toHaveBeenCalledTimes(2);
    expect(onChangeMock).not.toHaveBeenLastCalledWith('AB');
    expect((getByTestId('input') as HTMLInputElement).value).toBe('test-value');

    // now make form submitting and try to change a value
    rerender(
      <FormContext.Provider
        value={{ errors: {}, submitting: true, valid: true, validating: false } as any}
      >
        <Input
          initialValue="test-value"
          onChange={onChangeMock}
          onChangingChange={onChangingChangeMock}
          onFocusChange={onFocusChangeMock}
        />
      </FormContext.Provider>,
    );

    fireEvent.change(getByTestId('input'), { target: { value: 'AB' } });

    expect(onChangeMock).toHaveBeenCalledTimes(2);
    expect(onChangeMock).not.toHaveBeenLastCalledWith('AB');
    expect((getByTestId('input') as HTMLInputElement).value).toBe('test-value');
  });
});
