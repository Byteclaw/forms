import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { ValidationError } from '../../hooks';
import { Field, Form, FormProvider, ObjectField } from '..';

describe('Form', () => {
  it('works correctly (validate on submit)', async () => {
    let formState: any = null;
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
      .mockResolvedValueOnce(Promise.resolve())
      .mockResolvedValueOnce(Promise.resolve())
      .mockResolvedValueOnce(Promise.resolve());
    const { getByTestId } = render(
      <Form data-testid="form" onSubmit={onSubmit} onValidate={onValidate}>
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
      changingCount: 1,
      dirty: false,
      initialValue: undefined,
      value: undefined,
    });

    // now debounce (propagates that field is changed)
    act(() => jest.runAllTimers());

    expect(formState).toMatchObject({
      status: 'IDLE',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { person: { firstName: 'a' } },
    });

    // now try to submit and change when is working
    fireEvent.submit(getByTestId('form'));

    expect(formState).toMatchObject({
      status: 'VALIDATING',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { person: { firstName: 'a' } },
    });

    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'IDLE',
      changingCount: 0,
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
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'a' } },
    });

    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'IDLE',
      changingCount: 0,
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
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'a' } },
    });

    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'IDLE',
      changingCount: 0,
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
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'a' } },
    });

    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'IDLE',
      changingCount: 0,
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
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'a' } },
    });

    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'SUBMITTING',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'a' } },
    });

    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'IDLE',
      changingCount: 0,
      error: {
        '': 'Submit error',
      },
      dirty: true,
      initialValue: undefined,
      valid: false,
      value: { person: { firstName: 'a' } },
    });

    fireEvent.submit(getByTestId('form'));

    expect(formState).toMatchObject({
      status: 'VALIDATING',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'a' } },
    });

    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'SUBMITTING',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'a' } },
    });

    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'IDLE',
      changingCount: 0,
      error: {
        '': 'Submit Validation Error',
      },
      dirty: true,
      initialValue: undefined,
      valid: false,
      value: { person: { firstName: 'a' } },
    });

    fireEvent.submit(getByTestId('form'));

    expect(formState).toMatchObject({
      status: 'VALIDATING',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'a' } },
    });

    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'SUBMITTING',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'a' } },
    });

    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'IDLE',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      valid: true,
      value: { person: { firstName: 'a' } },
    });
  });

  it('works correctly (validate on change)', async () => {
    let formState: any = null;
    const onValidate = jest
      .fn()
      .mockRejectedValueOnce(new ValidationError([{ path: [], error: 'Root Error' }]))
      .mockRejectedValueOnce(new ValidationError([{ path: ['person'], error: 'Object Error' }]))
      .mockRejectedValueOnce(
        new ValidationError([{ path: ['person', 'firstName'], error: 'First name Error' }]),
      )
      .mockResolvedValueOnce(Promise.resolve());
    const { getByTestId } = render(
      <Form data-testid="form" onValidate={onValidate} validateOnChange>
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

    expect(formState).toMatchObject({ status: 'CHANGING', changingCount: 1 });

    // now debounce (propagates that field is changed)
    act(() => jest.runAllTimers());
    // debounce validate on change
    act(() => jest.runAllTimers());

    expect(formState).toMatchObject({ status: 'VALIDATING_ON_CHANGE', changingCount: 0 });

    await Promise.resolve();

    expect(formState).toMatchObject({
      dirty: true,
      error: { '': 'Root Error' },
      status: 'IDLE',
      changingCount: 0,
      value: { person: { firstName: 'a' } },
      valid: false,
    });

    // change first name, triggers change
    fireEvent.change(getByTestId('firstName'), { target: { value: 'ab' } });

    expect(formState).toMatchObject({ status: 'CHANGING', changingCount: 1 });

    // now debounce (propagates that field is changed)
    act(() => jest.runAllTimers());
    // debounce validate on change
    act(() => jest.runAllTimers());

    expect(formState).toMatchObject({ status: 'VALIDATING_ON_CHANGE', changingCount: 0 });

    await Promise.resolve();

    expect(formState).toMatchObject({
      dirty: true,
      error: { person: 'Object Error' },
      status: 'IDLE',
      changingCount: 0,
      value: { person: { firstName: 'ab' } },
      valid: false,
    });

    // change first name, triggers change
    fireEvent.change(getByTestId('firstName'), { target: { value: 'abc' } });

    expect(formState).toMatchObject({ status: 'CHANGING', changingCount: 1 });

    // now debounce (propagates that field is changed)
    act(() => jest.runAllTimers());
    // debounce validate on change
    act(() => jest.runAllTimers());

    expect(formState).toMatchObject({ status: 'VALIDATING_ON_CHANGE', changingCount: 0 });

    await Promise.resolve();

    expect(formState).toMatchObject({
      dirty: true,
      error: { person: { firstName: 'First name Error' } },
      status: 'IDLE',
      changingCount: 0,
      value: { person: { firstName: 'abc' } },
      valid: false,
    });
  });
});
