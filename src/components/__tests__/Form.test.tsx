import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { ValidationError } from '../../hooks';
import { Field, Form, FormProvider, ObjectField } from '..';

describe('Form', () => {
  it('works correctly (validate on submit)', async () => {
    let formState: any = null;
    const onChange = jest.fn().mockResolvedValue(undefined);
    const onSubmit = jest
      .fn()
      .mockRejectedValueOnce(new Error('Submit error'))
      .mockRejectedValueOnce(new ValidationError([{ path: [], error: 'Submit Validation Error' }]))
      .mockResolvedValueOnce(Promise.resolve());
    const onValidate = jest
      .fn()
      .mockRejectedValueOnce(new ValidationError([{ path: [], error: 'Root Error' }]))
      .mockRejectedValueOnce(new ValidationError([{ path: [''], error: 'Root Error' }]))
      .mockRejectedValueOnce(new ValidationError([{ path: ['person'], error: 'Object Error' }]))
      .mockRejectedValueOnce(
        new ValidationError([{ path: ['person', 'firstName'], error: 'First name Error' }]),
      )
      .mockResolvedValueOnce(Promise.resolve({ person: { firstName: 'Normalized' } }))
      .mockResolvedValueOnce(Promise.resolve())
      .mockResolvedValueOnce(Promise.resolve());
    const { getByTestId } = render(
      <Form data-testid="form" onChange={onChange} onSubmit={onSubmit} onValidate={onValidate}>
        <ObjectField name="person">
          <Field data-testid="firstName" name="firstName" />
          <Field data-testid="lastName" name="lastName" />
        </ObjectField>
        <FormProvider>
          {state => {
            formState = state;
            return null;
          }}
        </FormProvider>
      </Form>,
    );

    // change first name, triggers change
    fireEvent.change(getByTestId('firstName'), { target: { value: 'a' } });

    expect(formState).toMatchObject({
      status: 'CHANGING',
      changing: true,
      changingFields: {
        person: true,
      },
      dirty: false,
      initialValue: undefined,
      value: undefined,
    });

    // now debounce (propagates that field is changed)
    act(() => jest.runAllTimers());

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({ person: { firstName: 'a' } });

    expect(formState).toMatchObject({
      status: 'IDLE',
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { person: { firstName: 'a' } },
    });

    // now try to submit and change when is working
    fireEvent.submit(getByTestId('form'));

    expect(formState).toMatchObject({
      status: 'VALIDATING',
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { person: { firstName: 'a' } },
    });

    // resolve validator
    await Promise.resolve();

    expect(onValidate).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);

    // resolve validation promise
    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'IDLE',
      changing: false,
      changingFields: {},
      error: {
        '': 'Root Error',
      },
      dirty: true,
      initialValue: undefined,
      valid: false,
      value: { person: { firstName: 'a' } },
    });

    fireEvent.submit(getByTestId('form'));

    expect(formState).toMatchObject({
      status: 'VALIDATING',
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'a' } },
    });

    // resolve onChange and validation
    await Promise.resolve();

    expect(onValidate).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenCalledTimes(1);

    // resolve validation promise
    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'IDLE',
      changing: false,
      changingFields: {},
      error: {
        '': 'Root Error',
      },
      dirty: true,
      initialValue: undefined,
      valid: false,
      value: { person: { firstName: 'a' } },
    });

    fireEvent.submit(getByTestId('form'));

    expect(formState).toMatchObject({
      status: 'VALIDATING',
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'a' } },
    });

    // resolve onChange and validation
    await Promise.resolve();

    expect(onValidate).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenCalledTimes(1);

    // resolve validation promise
    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'IDLE',
      changing: false,
      changingFields: {},
      error: {
        person: 'Object Error',
      },
      dirty: true,
      initialValue: undefined,
      valid: false,
      value: { person: { firstName: 'a' } },
    });

    fireEvent.submit(getByTestId('form'));

    expect(formState).toMatchObject({
      status: 'VALIDATING',
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'a' } },
    });

    // resolve onChange and validation
    await Promise.resolve();

    expect(onValidate).toHaveBeenCalledTimes(4);
    expect(onChange).toHaveBeenCalledTimes(1);

    // resolve validation promise
    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'IDLE',
      changing: false,
      changingFields: {},
      error: {
        person: {
          firstName: 'First name Error',
        },
      },
      dirty: true,
      initialValue: undefined,
      valid: false,
      value: { person: { firstName: 'a' } },
    });

    expect(getByTestId('firstName').getAttribute('aria-invalid')).toBe('true');

    fireEvent.submit(getByTestId('form'));

    expect(formState).toMatchObject({
      status: 'VALIDATING',
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'a' } },
    });

    // resolve onChange and validation
    await Promise.resolve();

    expect(onValidate).toHaveBeenCalledTimes(5);
    // resolve validation promise
    await Promise.resolve();

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith({ person: { firstName: 'Normalized' } });

    expect(getByTestId('firstName').getAttribute('value')).toBe('Normalized');

    expect(formState).toMatchObject({
      status: 'SUBMITTING',
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'Normalized' } },
    });

    // resolve submit handler
    await Promise.resolve();
    await Promise.resolve();

    expect(onSubmit).toHaveBeenNthCalledWith(1, { person: { firstName: 'Normalized' } });

    expect(formState).toMatchObject({
      status: 'IDLE',
      changing: false,
      changingFields: {},
      error: {
        '': 'Submit error',
      },
      dirty: true,
      initialValue: undefined,
      valid: false,
      value: { person: { firstName: 'Normalized' } },
    });

    fireEvent.submit(getByTestId('form'));

    expect(formState).toMatchObject({
      status: 'VALIDATING',
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'Normalized' } },
    });

    // resolve validator
    await Promise.resolve();
    // resolve validator promise
    await Promise.resolve();
    expect(onChange).toHaveBeenCalledTimes(2);
    // resolve onChange
    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'SUBMITTING',
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'Normalized' } },
    });

    // resolve submit handler
    await Promise.resolve();
    // resolve validator promise
    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'IDLE',
      changing: false,
      changingFields: {},
      error: {
        '': 'Submit Validation Error',
      },
      dirty: true,
      initialValue: undefined,
      valid: false,
      value: { person: { firstName: 'Normalized' } },
    });

    fireEvent.submit(getByTestId('form'));

    expect(formState).toMatchObject({
      status: 'VALIDATING',
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'Normalized' } },
    });

    // resolve validator
    await Promise.resolve();
    // resolve validator promise
    await Promise.resolve();

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith({ person: { firstName: 'Normalized' } });

    expect(formState).toMatchObject({
      status: 'SUBMITTING',
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'Normalized' } },
    });

    // resolve submit handler
    await Promise.resolve();
    // resolve submit promise
    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'IDLE',
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'Normalized' } },
    });

    expect(onChange).toBeCalledTimes(2);
  });

  it('works correctly (validate on change)', async () => {
    let formState: any = null;
    const onChange = jest.fn().mockResolvedValue(undefined);
    const onValidate = jest
      .fn()
      .mockRejectedValueOnce(new ValidationError([{ path: [], error: 'Root Error' }]))
      .mockRejectedValueOnce(new ValidationError([{ path: ['person'], error: 'Object Error' }]))
      .mockRejectedValueOnce(
        new ValidationError([{ path: ['person', 'firstName'], error: 'First name Error' }]),
      )
      .mockResolvedValueOnce(Promise.resolve({ person: { firstName: 'Normalized' } }));
    const { getByTestId } = render(
      <Form data-testid="form" onChange={onChange} onValidate={onValidate} validateOnChange>
        <ObjectField name="person">
          <Field data-testid="firstName" name="firstName" />
          <Field data-testid="lastName" name="lastName" />
        </ObjectField>
        <FormProvider>
          {state => {
            formState = state;
            return null;
          }}
        </FormProvider>
      </Form>,
    );

    // change first name, triggers change
    fireEvent.change(getByTestId('firstName'), { target: { value: 'a' } });

    expect(formState).toMatchObject({
      status: 'CHANGING',
      changing: true,
      changingFields: { person: true },
    });

    // now debounce (propagates that field is changed)
    act(() => jest.runAllTimers());

    expect(formState).toMatchObject({
      status: 'VALIDATING_ON_CHANGE',
      changing: false,
      changingFields: {},
    });

    // resolve validator
    await Promise.resolve();
    await Promise.resolve();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ person: { firstName: 'a' } });

    expect(formState).toMatchObject({
      dirty: true,
      error: { '': 'Root Error' },
      status: 'IDLE',
      changing: false,
      changingFields: {},
      value: { person: { firstName: 'a' } },
      valid: false,
    });

    // change first name, triggers change
    fireEvent.change(getByTestId('firstName'), { target: { value: 'ab' } });

    expect(formState).toMatchObject({
      status: 'CHANGING',
      changing: true,
      changingFields: { person: true },
    });

    // now debounce (propagates that field is changed)
    act(() => jest.runAllTimers());

    expect(formState).toMatchObject({
      status: 'VALIDATING_ON_CHANGE',
      changing: false,
      changingFields: {},
    });

    // resolve validator
    await Promise.resolve();
    // resolve validator promise
    await Promise.resolve();

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith({ person: { firstName: 'ab' } });

    await Promise.resolve();

    expect(formState).toMatchObject({
      dirty: true,
      error: { person: 'Object Error' },
      status: 'IDLE',
      changing: false,
      changingFields: {},
      value: { person: { firstName: 'ab' } },
      valid: false,
    });

    // change first name, triggers change
    fireEvent.change(getByTestId('firstName'), { target: { value: 'abc' } });

    expect(formState).toMatchObject({
      status: 'CHANGING',
      changing: true,
      changingFields: {
        person: true,
      },
    });

    // now debounce (propagates that field is changed)
    act(() => jest.runAllTimers());

    expect(formState).toMatchObject({
      status: 'VALIDATING_ON_CHANGE',
      changing: false,
      changingFields: {},
    });

    // resolve validator
    await Promise.resolve();
    // resolve validator promise
    await Promise.resolve();

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenLastCalledWith({ person: { firstName: 'abc' } });

    expect(formState).toMatchObject({
      dirty: true,
      error: { person: { firstName: 'First name Error' } },
      status: 'IDLE',
      changing: false,
      changingFields: {},
      value: { person: { firstName: 'abc' } },
      valid: false,
    });

    // change first name, triggers change
    fireEvent.change(getByTestId('firstName'), { target: { value: 'abcd' } });

    expect(formState).toMatchObject({
      status: 'CHANGING',
      changing: true,
      changingFields: {
        person: true,
      },
    });

    // now debounce (propagates that field is changed)
    act(() => jest.runAllTimers());

    expect(formState).toMatchObject({
      status: 'VALIDATING_ON_CHANGE',
      changing: false,
      changingFields: {},
      value: { person: { firstName: 'abcd' } },
    });

    // resolve validator
    await Promise.resolve();
    // resolve validator promise
    await Promise.resolve();

    expect(onChange).toHaveBeenCalledTimes(5);
    expect(onChange).toHaveBeenLastCalledWith({ person: { firstName: 'Normalized' } });

    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'IDLE',
      changing: false,
      changingFields: {},
      value: { person: { firstName: 'Normalized' } },
    });
  });
});
