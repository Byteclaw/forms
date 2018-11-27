// tslint:disable:jsx-no-lambda
import React, { Fragment, SyntheticEvent } from 'react';
import { fireEvent, render, wait } from 'react-testing-library';
import useObjectField from '../useObjectField';

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

describe('useObjectField hook', () => {
  it('works corretly', async () => {
    const onChangeMock = jest.fn();
    const { getByTestId, rerender } = render(<Input enableReinitialize={true} onChange={onChangeMock} />);

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
    fireEvent.change(getByTestId('input'), { target: { value: '{"a":1}' } });
    fireEvent.change(getByTestId('input'), { target: { value: '{"a":1,"b":2}' } });
    expect((getByTestId('input') as HTMLInputElement).value).toBe('{"a":1,"b":2}');

    expect(getByTestId('changing').innerHTML).toBe('true');
    expect(getByTestId('dirty').innerHTML).toBe('true');

    await wait(() => {
      expect(getByTestId('changing').innerHTML).toBe('false');
    });

    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith({ a: 1, b: 2 });

    // now change initial value
    rerender(
      <Input enableReinitialize={true} initialValue={{ a: 2, b: 1, c: 3 }} onChange={onChangeMock} />,
    );

    expect(onChangeMock).toHaveBeenCalledTimes(2);
    expect(onChangeMock).toHaveBeenCalledWith({ a: 2, b: 1, c: 3 });

    expect(getByTestId('dirty').innerHTML).toBe('false');
    expect((getByTestId('input') as HTMLInputElement).value).toBe('{"a":2,"b":1,"c":3}');
    expect(getByTestId('initialValue').innerHTML).toBe('{"a":2,"b":1,"c":3}');

    // set field
    fireEvent.click(getByTestId('setField'), { target: { field: 'd', value: '4' } });
    expect(getByTestId('changing').innerHTML).toBe('true');
    expect((getByTestId('input') as HTMLInputElement).value).toBe('{"a":2,"b":1,"c":3,"d":"4"}');

    await wait(() => {
      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(onChangeMock).toHaveBeenCalledTimes(3);
      expect(onChangeMock).toHaveBeenCalledWith({ a: 2, b: 1, c: 3, d: '4' });
    });

    // set field
    fireEvent.click(getByTestId('setField'), { target: { field: 'a', value: '4' } });
    expect(getByTestId('changing').innerHTML).toBe('true');
    expect((getByTestId('input') as HTMLInputElement).value).toBe('{"a":"4","b":1,"c":3,"d":"4"}');

    await wait(() => {
      expect(getByTestId('changing').innerHTML).toBe('false');
      expect(onChangeMock).toHaveBeenCalledTimes(4);
      expect(onChangeMock).toHaveBeenCalledWith({ a: '4', b: 1, c: 3, d: '4' });
    });
  });
});
