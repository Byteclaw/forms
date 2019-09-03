import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { ObjectField, Field, Form, FormProvider } from '..';

describe('ObjectField', () => {
  it('works correctly', async () => {
    let formState: any = null;
    const onSubmit = jest.fn().mockResolvedValue(Promise.resolve());
    const onValidate = jest.fn().mockResolvedValue(Promise.resolve());
    const { getByTestId, rerender } = render(
      <Form data-testid="form" onSubmit={onSubmit} onValidate={onValidate}>
        <ObjectField name="person">
          <Field data-testid="firstName" name="firstName" />
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

    expect(formState).toMatchObject({
      status: 'IDLE',
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { person: { firstName: 'a' } },
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
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { person: { firstName: 'abcdef' } },
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
      value: { person: { firstName: 'abcdef' } },
    });

    // try to change now
    fireEvent.change(getByTestId('firstName'), { target: { value: 'abcdefaaa' } });

    expect(formState).toMatchObject({
      status: 'VALIDATING',
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { person: { firstName: 'abcdef' } },
    });

    // resolve validation
    await act(() => Promise.resolve());

    expect(formState).toMatchObject({
      status: 'SUBMITTING',
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { person: { firstName: 'abcdef' } },
    });

    // try to change now
    fireEvent.change(getByTestId('firstName'), { target: { value: 'abcdefaaa' } });

    expect(formState).toMatchObject({
      status: 'SUBMITTING',
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { person: { firstName: 'abcdef' } },
    });

    // resolve submit handler
    await act(() => Promise.resolve());

    expect(formState).toMatchObject({
      status: 'IDLE',
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { person: { firstName: 'abcdef' } },
    });

    // change initial values
    rerender(
      <Form
        data-testid="form"
        initialValue={{ person: { firstName: 'Fero' } }}
        onSubmit={onSubmit}
        onValidate={onValidate}
      >
        <ObjectField name="person">
          <Field data-testid="firstName" name="firstName" />
        </ObjectField>
        <FormProvider>
          {state => {
            formState = state;
            return null;
          }}
        </FormProvider>
      </Form>,
    );

    expect(formState).toMatchObject({
      status: 'IDLE',
      changing: false,
      changingFields: {},
      error: undefined,
      dirty: false,
      initialValue: { person: { firstName: 'Fero' } },
      value: { person: { firstName: 'Fero' } },
    });
  });
});
