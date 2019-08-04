import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { ArrayField, Field, Form, FormProvider } from '..';

describe('ArrayField', () => {
  it('works correctly', async () => {
    let formState: any = null;
    const onSubmit = jest.fn().mockResolvedValue(Promise.resolve());
    const onValidate = jest.fn().mockResolvedValue(Promise.resolve());
    const { getByTestId, rerender } = render(
      <Form data-testid="form" onSubmit={onSubmit} onValidate={onValidate}>
        <ArrayField name="phones">
          <Field data-testid="0" name="0" />
        </ArrayField>
        <FormProvider>
          {state => {
            formState = state;
            return null;
          }}
        </FormProvider>
      </Form>,
    );

    // change first name, triggers change
    fireEvent.change(getByTestId('0'), { target: { value: 'a' } });

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
      value: { phones: ['a'] },
    });

    fireEvent.change(getByTestId('0'), { target: { value: 'ab' } });
    fireEvent.change(getByTestId('0'), { target: { value: 'abc' } });
    fireEvent.change(getByTestId('0'), { target: { value: 'abcd' } });
    fireEvent.change(getByTestId('0'), { target: { value: 'abcde' } });
    fireEvent.change(getByTestId('0'), { target: { value: 'abcdef' } });

    // now debounce (propagates that field is changed)
    act(() => jest.runAllTimers());

    expect(formState).toMatchObject({
      status: 'IDLE',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { phones: ['abcdef'] },
    });

    // now try to submit and change when is working
    fireEvent.submit(getByTestId('form'));

    expect(formState).toMatchObject({
      status: 'VALIDATING',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { phones: ['abcdef'] },
    });

    // try to change now
    fireEvent.change(getByTestId('0'), { target: { value: 'abcdefaaa' } });

    expect(formState).toMatchObject({
      status: 'VALIDATING',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { phones: ['abcdef'] },
    });

    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'SUBMITTING',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { phones: ['abcdef'] },
    });

    // try to change now
    fireEvent.change(getByTestId('0'), { target: { value: 'abcdefaaa' } });

    expect(formState).toMatchObject({
      status: 'SUBMITTING',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { phones: ['abcdef'] },
    });

    await Promise.resolve();

    expect(formState).toMatchObject({
      status: 'IDLE',
      changingCount: 0,
      error: undefined,
      dirty: true,
      initialValue: undefined,
      value: { phones: ['abcdef'] },
    });

    // change initial values
    rerender(
      <Form
        data-testid="form"
        initialValue={{ phones: ['abc', 'efg'] }}
        onSubmit={onSubmit}
        onValidate={onValidate}
      >
        <ArrayField name="phones">
          <Field data-testid="0" name="0" />
        </ArrayField>
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
      changingCount: 0,
      error: undefined,
      dirty: false,
      initialValue: { phones: ['abc', 'efg'] },
      value: { phones: ['abc', 'efg'] },
    });
  });
});
