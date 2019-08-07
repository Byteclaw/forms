import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Field, Form, FormProvider } from '..';

describe('Field', () => {
  it('works correctly', async () => {
    let formState: any = null;
    const onSubmit = jest.fn().mockResolvedValue(Promise.resolve());
    const onValidate = jest.fn().mockResolvedValue(Promise.resolve());
    const { getByTestId } = render(
      <Form data-testid="form" onSubmit={onSubmit} onValidate={onValidate}>
        <Field data-testid="firstName" name="firstName" />
        <Field data-testid="lastName" name="lastName" />
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
      value: { firstName: 'a' },
    });

    fireEvent.change(getByTestId('firstName'), { target: { value: 'ab' } });
    fireEvent.change(getByTestId('firstName'), { target: { value: 'abc' } });
    fireEvent.change(getByTestId('firstName'), { target: { value: 'abcd' } });
    fireEvent.change(getByTestId('firstName'), { target: { value: 'abcde' } });
    fireEvent.change(getByTestId('firstName'), { target: { value: 'abcdef' } });

    // now debounce (propagates that field is changed)
    act(() => jest.runAllTimers());

    expect(formState).toMatchObject({
      status: 'IDLE',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { firstName: 'abcdef' },
    });

    // now try to submit and change when is working
    fireEvent.submit(getByTestId('form'));

    expect(formState).toMatchObject({
      status: 'VALIDATING',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { firstName: 'abcdef' },
    });

    // try to change now
    fireEvent.change(getByTestId('firstName'), { target: { value: 'abcdefaaa' } });

    expect(formState).toMatchObject({
      status: 'VALIDATING',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { firstName: 'abcdef' },
    });

    // resolve validator
    await Promise.resolve();
    // resolve validation promise
    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'SUBMITTING',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { firstName: 'abcdef' },
    });

    // try to change now
    fireEvent.change(getByTestId('firstName'), { target: { value: 'abcdefaaa' } });

    expect(formState).toMatchObject({
      status: 'SUBMITTING',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { firstName: 'abcdef' },
    });

    // resolve submit handler
    await Promise.resolve();
    // resolve submit promise
    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'IDLE',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { firstName: 'abcdef' },
    });
  });

  it('propagates changed event if unmounted and does not propagate a changed value', async () => {
    let formState: any = null;
    const onSubmit = jest.fn();

    function ControlledForm({ hideInput = false }: { hideInput?: boolean }) {
      return (
        <Form onSubmit={onSubmit}>
          {hideInput ? null : <Field data-testid="firstName" name="firstName" />}
          <Field data-testid="lastName" name="lastName" />
          <FormProvider>
            {state => {
              formState = state;
              return null;
            }}
          </FormProvider>
        </Form>
      );
    }

    const { getByTestId, rerender } = render(<ControlledForm />);

    // change first name, triggers change
    fireEvent.change(getByTestId('firstName'), { target: { value: 'a' } });

    expect(formState).toMatchObject({
      status: 'CHANGING',
      changingCount: 1,
      error: undefined,
      dirty: false,
      initialValue: undefined,
      value: undefined,
    });

    rerender(<ControlledForm hideInput />);

    // now debounce (propagates that field is changed)
    act(() => jest.runAllTimers());

    expect(formState).toMatchObject({
      status: 'IDLE',
      changingCount: 0,
      error: undefined,
      dirty: false,
      initialValue: undefined,
      value: undefined,
    });
  });
});
