import React from 'react';
import { fireEvent, render, wait } from 'react-testing-library';
import * as yup from 'yup';
import Field from '../../components/Field';
import FieldError from '../../components/FieldError';
import ObjectField from '../../components/ObjectField';
import useForm from '../useForm';

function Form({
  initialValues,
  onSubmit,
  validator,
}: {
  initialValues?: { [key: string]: any };
  onSubmit: () => any;
  validator?: any;
}) {
  const form = useForm(initialValues, onSubmit, validator);

  return (
    <form data-testid="form" onSubmit={form.handleSubmit}>
      <form.FormProvider value={form}>
        <form.FieldProvider value={form}>
          <Field data-testid="email-input" debounceDelay={2} name="email" type="email" />
          <Field data-testid="password-input" debounceDelay={20} name="password" type="password" />
          <ObjectField debounceDelay={2} name="object">
            <Field data-testid="color-input" debounceDelay={1} name="color" />
          </ObjectField>
          <FieldError name="">
            {({ error }) => <span data-testid="form-error">{error || ''}</span>}
          </FieldError>
        </form.FieldProvider>
      </form.FormProvider>
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

describe('useForm hook', () => {
  it('works correctly', async () => {
    const onSubmitMock = jest
      .fn()
      .mockImplementationOnce(() => new Promise(r => setTimeout(r, 10)));
    const { getByTestId } = render(<Form onSubmit={onSubmitMock} validator={validationSchema} />);

    expect(getByTestId('changing').innerHTML).toBe('false');
    expect(getByTestId('submitting').innerHTML).toBe('false');
    expect(getByTestId('validating').innerHTML).toBe('false');

    fireEvent.change(getByTestId('email-input'), { target: { value: 'a' } });
    fireEvent.change(getByTestId('password-input'), { target: { value: 'a' } });

    expect(getByTestId('changing').innerHTML).toBe('true');

    // wait for email to be not changing but password should be changing
    // because it has longer debounce
    await new Promise(r => setTimeout(r, 4));

    expect(getByTestId('changing').innerHTML).toBe('true');

    await wait(() => {
      expect(getByTestId('changing').innerHTML).toBe('false');
    });

    // wait for input to notify about change
    await new Promise(r => setTimeout(r, 5));

    // now submit the form
    fireEvent.submit(getByTestId('form'));

    await wait(() => {
      expect(getByTestId('validating').innerHTML).toBe('false');
    });

    expect(onSubmitMock).not.toHaveBeenCalled();

    // now change the value, so form is valid
    fireEvent.change(getByTestId('email-input'), { target: { value: 'a@a.com' } });

    await wait(() => {
      expect(getByTestId('changing').innerHTML).toBe('false');
    });

    fireEvent.submit(getByTestId('form'));

    await wait(() => {
      expect(getByTestId('validating').innerHTML).toBe('false');
      expect(getByTestId('submitting').innerHTML).toBe('true');
    });

    await wait(() => {
      expect(getByTestId('submitting').innerHTML).toBe('false');
    });

    expect(onSubmitMock).toHaveBeenCalledTimes(1);
    expect(onSubmitMock).toHaveBeenCalledWith({ email: 'a@a.com', password: 'a' });

    // if onSubmit throws, register it as global error
    onSubmitMock.mockImplementationOnce(async () => {
      throw new Error('Submit error');
    });

    fireEvent.submit(getByTestId('form'));

    await wait(() => {
      expect(getByTestId('validating').innerHTML).toBe('false');
      expect(getByTestId('submitting').innerHTML).toBe('false');
    });

    await wait(() => {
      expect(getByTestId('submitting').innerHTML).toBe('false');
    });

    expect(getByTestId('form-error').innerHTML).toBe('Submit error');
  });

  it('works with initial values', async () => {
    const onSubmitMock = jest.fn().mockImplementation(() => new Promise(r => setTimeout(r, 10)));
    const initialValues = {
      email: 'a@a.com',
      password: 'test',
    };
    const { getByTestId, rerender } = render(
      <Form initialValues={initialValues} onSubmit={onSubmitMock} />,
    );

    expect((getByTestId('email-input') as HTMLInputElement).value).toBe('a@a.com');
    expect((getByTestId('password-input') as HTMLInputElement).value).toBe('test');

    // now change the value of email
    fireEvent.change(getByTestId('email-input'), { target: { value: 'b@b.com' } });
    fireEvent.change(getByTestId('password-input'), { target: { value: 'new-password' } });
    fireEvent.change(getByTestId('color-input'), { target: { value: 'new-color' } });

    await wait(() => expect(getByTestId('changing').innerHTML).toBe('true'));
    await wait(() => expect(getByTestId('changing').innerHTML).toBe('false'));

    // now erase email
    fireEvent.change(getByTestId('email-input'), { target: { value: '' } });

    await wait(() => expect(getByTestId('changing').innerHTML).toBe('true'));
    await wait(() => expect(getByTestId('changing').innerHTML).toBe('false'));

    expect((getByTestId('email-input') as HTMLInputElement).value).toBe('');

    // now change the value of email
    fireEvent.change(getByTestId('email-input'), { target: { value: 'b@b.com' } });

    await wait(() => expect(getByTestId('changing').innerHTML).toBe('true'));
    await wait(() => expect(getByTestId('changing').innerHTML).toBe('false'));

    // now check the value of input
    expect((getByTestId('email-input') as HTMLInputElement).value).toBe('b@b.com');
    expect((getByTestId('password-input') as HTMLInputElement).value).toBe('new-password');
    expect((getByTestId('color-input') as HTMLInputElement).value).toBe('new-color');

    fireEvent.submit(getByTestId('form'));

    await wait(() => expect(getByTestId('submitting').innerHTML).toBe('true'));
    await wait(() => expect(getByTestId('submitting').innerHTML).toBe('false'));

    expect(onSubmitMock).toHaveBeenCalledTimes(1);
    expect(onSubmitMock).toHaveBeenCalledWith({
      email: 'b@b.com',
      object: { color: 'new-color' },
      password: 'new-password',
    });

    // now change initialValues
    // because the initial value of test is the same
    // it should keep the value of input
    const newInitialValues = {
      email: 'c@c.com',
      object: { color: 'test-color' },
      password: 'test',
    };

    rerender(<Form initialValues={newInitialValues} onSubmit={onSubmitMock} />);

    expect((getByTestId('email-input') as HTMLInputElement).value).toBe('c@c.com');
    expect((getByTestId('password-input') as HTMLInputElement).value).toBe('new-password');
    expect((getByTestId('color-input') as HTMLInputElement).value).toBe('test-color');

    await wait(() => expect(getByTestId('changing').innerHTML).toBe('false'));

    // submit form
    fireEvent.submit(getByTestId('form'));

    await wait(() => expect(getByTestId('submitting').innerHTML).toBe('true'));
    await wait(() => expect(getByTestId('submitting').innerHTML).toBe('false'));

    expect(onSubmitMock).toHaveBeenCalledTimes(2);
    expect(onSubmitMock).toHaveBeenCalledWith({
      email: 'c@c.com',
      object: {
        color: 'test-color',
      },
      password: 'new-password',
    });
  });
});
