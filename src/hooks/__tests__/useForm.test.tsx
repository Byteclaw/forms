import { act, fireEvent, render } from '@testing-library/react';
// @ts-ignore
import React, { ConcurrentMode, unstable_ConcurrentMode } from 'react';
import * as yup from 'yup';
import Field from '../../components/Field';
import FieldError from '../../components/FieldError';
import ObjectField from '../../components/ObjectField';
import useForm from '../useForm';

const Concurrent = unstable_ConcurrentMode || ConcurrentMode;

function Form({
  enableReinitialize,
  initialValues,
  onSubmit,
  validator,
}: {
  enableReinitialize?: boolean;
  initialValues?: { [key: string]: any };
  onSubmit: () => any;
  validator?: any;
}) {
  const form = useForm(initialValues, onSubmit, validator, false, enableReinitialize);

  return (
    <form data-testid="form" onSubmit={form.handleSubmit}>
      <form.FormProvider value={form}>
        <form.FieldProvider value={form}>
          <Field data-testid="email-input" debounceDelay={2} name="email" type="email" />
          <Field data-testid="password-input" debounceDelay={2} name="password" type="password" />
          <ObjectField debounceDelay={2} name="object">
            <Field data-testid="color-input" debounceDelay={1} name="color" />
          </ObjectField>
          <FieldError name="">
            {({ error }) => <span data-testid="form-error">{error || ''}</span>}
          </FieldError>
        </form.FieldProvider>
      </form.FormProvider>
      <span data-testid="valid">{form.valid.toString()}</span>
      <span data-testid="changing">{form.changing.toString()}</span>
      <span data-testid="submitting">{form.submitting.toString()}</span>
      <span data-testid="validating">{form.validating.toString()}</span>
    </form>
  );
}

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .required(),
  password: yup.string().required(),
});

describe.each([['Sync mode', 'div'], ['Concurrent mode', Concurrent]])('useForm hook (%s)', () => {
  it('works correctly', () => {
    const onSubmitMock = jest.fn().mockImplementationOnce(() => new Promise(r => r()));
    const { getByTestId } = render(<Form onSubmit={onSubmitMock} validator={validationSchema} />);

    expect(getByTestId('changing').innerHTML).toBe('false');
    expect(getByTestId('submitting').innerHTML).toBe('false');
    expect(getByTestId('validating').innerHTML).toBe('false');
    expect(getByTestId('valid').innerHTML).toBe('true');

    fireEvent.change(getByTestId('email-input'), { target: { value: 'a' } });
    fireEvent.change(getByTestId('password-input'), { target: { value: 'a' } });

    expect(getByTestId('changing').innerHTML).toBe('true');

    // resolve debounce on email input and password input
    act(() => jest.runAllTimers());
    // resolve debounce on form
    act(() => jest.runOnlyPendingTimers());

    expect(getByTestId('changing').innerHTML).toBe('false');

    // now submit the form
    fireEvent.submit(getByTestId('form'));

    expect(getByTestId('validating').innerHTML).toBe('true');

    act(() => jest.runAllImmediates());

    expect(onSubmitMock).not.toHaveBeenCalled();

    expect(getByTestId('validating').innerHTML).toBe('false');

    // now change the value, so form is valid
    fireEvent.change(getByTestId('email-input'), { target: { value: 'a@a.com' } });

    // resolve debounce on email input
    act(() => jest.runOnlyPendingTimers());
    // resolve debounce on form
    act(() => jest.runOnlyPendingTimers());

    expect(getByTestId('changing').innerHTML).toBe('false');

    fireEvent.submit(getByTestId('form'));

    expect(getByTestId('validating').innerHTML).toBe('true');

    // this'll finish the validation but also it'll finish submission too
    act(() => jest.runAllImmediates());

    expect(getByTestId('valid').innerHTML).toBe('true');
    expect(getByTestId('validating').innerHTML).toBe('false');
    expect(getByTestId('submitting').innerHTML).toBe('false');

    expect(onSubmitMock).toHaveBeenCalledTimes(1);
    expect(onSubmitMock).toHaveBeenCalledWith({ email: 'a@a.com', password: 'a' });

    // if onSubmit throws, register it as global error
    onSubmitMock.mockImplementationOnce(() => Promise.reject(new Error('Submit error')));

    fireEvent.submit(getByTestId('form'));

    expect(getByTestId('validating').innerHTML).toBe('true');

    // this'll finish the validation but also it'll finish submission too
    act(() => jest.runAllImmediates());

    expect(getByTestId('validating').innerHTML).toBe('false');
    expect(getByTestId('valid').innerHTML).toBe('false');
    expect(getByTestId('submitting').innerHTML).toBe('false');
    expect(getByTestId('form-error').innerHTML).toBe('Submit error');
  });

  it('works with initial values', () => {
    const onSubmitMock = jest.fn().mockImplementation(() => new Promise(r => r()));
    const initialValues = {
      email: 'a@a.com',
      password: 'test',
    };
    const { getByTestId, rerender } = render(
      <Form enableReinitialize initialValues={initialValues} onSubmit={onSubmitMock} />,
    );

    expect((getByTestId('email-input') as HTMLInputElement).value).toBe('a@a.com');
    expect((getByTestId('password-input') as HTMLInputElement).value).toBe('test');

    // now change the value of email
    fireEvent.change(getByTestId('email-input'), { target: { value: 'b@b.com' } });
    fireEvent.change(getByTestId('password-input'), { target: { value: 'new-password' } });
    fireEvent.change(getByTestId('color-input'), { target: { value: 'new-color' } });

    expect(getByTestId('changing').innerHTML).toBe('true');

    // resolve debounces on all inputs
    act(() => jest.runAllTimers());
    // resolve debounces on all parent inputs (object field)
    act(() => jest.runOnlyPendingTimers());
    // resolve debounce on form
    act(() => jest.runOnlyPendingTimers());

    expect(getByTestId('changing').innerHTML).toBe('false');

    // now erase email
    fireEvent.change(getByTestId('email-input'), { target: { value: '' } });

    expect(getByTestId('changing').innerHTML).toBe('true');

    // resolve debounce on email input
    act(() => jest.runOnlyPendingTimers());
    // resolve debounce on form
    act(() => jest.runOnlyPendingTimers());

    expect(getByTestId('changing').innerHTML).toBe('false');
    expect((getByTestId('email-input') as HTMLInputElement).value).toBe('');

    // now change the value of email
    fireEvent.change(getByTestId('email-input'), { target: { value: 'b@b.com' } });

    expect(getByTestId('changing').innerHTML).toBe('true');

    // resolve debounce on email input
    act(() => jest.runOnlyPendingTimers());
    // resolve debounce on form
    act(() => jest.runOnlyPendingTimers());

    expect(getByTestId('changing').innerHTML).toBe('false');

    // now check the value of input
    expect((getByTestId('email-input') as HTMLInputElement).value).toBe('b@b.com');
    expect((getByTestId('password-input') as HTMLInputElement).value).toBe('new-password');
    expect((getByTestId('color-input') as HTMLInputElement).value).toBe('new-color');

    fireEvent.submit(getByTestId('form'));

    // resolve validation and submission
    act(() => jest.runAllImmediates());

    expect(getByTestId('submitting').innerHTML).toBe('false');

    expect(onSubmitMock).toHaveBeenCalledTimes(1);
    expect(onSubmitMock).toHaveBeenLastCalledWith({
      email: 'b@b.com',
      object: { color: 'new-color' },
      password: 'new-password',
    });

    // now change initialValues
    // because the initial value of test is the same
    // it should keep the value of input
    const newInitialValues = {
      // email should change to this value
      email: 'c@c.com',
      // object should change to this value
      object: { color: 'test-color' },
      // password should stay the same (new-password)
      password: 'test',
    };

    rerender(<Form enableReinitialize initialValues={newInitialValues} onSubmit={onSubmitMock} />);

    expect((getByTestId('email-input') as HTMLInputElement).value).toBe('c@c.com');
    expect((getByTestId('password-input') as HTMLInputElement).value).toBe('new-password');
    expect((getByTestId('color-input') as HTMLInputElement).value).toBe('test-color');

    expect(getByTestId('changing').innerHTML).toBe('true');

    // resolve debounce on all inputs
    act(() => jest.runAllTimers());
    // resolve debounce on parent inputs
    act(() => jest.runAllTimers());
    // resolve debounce on form
    act(() => jest.runAllTimers());

    expect(getByTestId('changing').innerHTML).toBe('false');

    // submit form
    fireEvent.submit(getByTestId('form'));

    // resolve validation and submission
    act(() => jest.runAllImmediates());

    expect(getByTestId('submitting').innerHTML).toBe('false');

    expect(onSubmitMock).toHaveBeenCalledTimes(2);
    expect(onSubmitMock).toHaveBeenLastCalledWith({
      email: 'c@c.com',
      object: {
        color: 'test-color',
      },
      password: 'new-password',
    });
  });
});
