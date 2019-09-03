import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { ValidationError } from '../../hooks';
import { Field, FieldError, Form, ObjectField } from '..';

describe('FieldError', () => {
  it('works correctly', async () => {
    const onValidate = jest
      .fn()
      .mockRejectedValueOnce(new ValidationError([{ path: [], error: 'Root Error' }]))
      .mockRejectedValueOnce(new ValidationError([{ path: ['person'], error: 'Object Error' }]))
      .mockRejectedValueOnce(
        new ValidationError([{ path: ['person', 'firstName'], error: 'First name Error' }]),
      )
      .mockResolvedValueOnce(Promise.resolve());
    const { getByTestId } = render(
      <Form data-testid="form" onValidate={onValidate}>
        <FieldError>
          {({ error }) => (error ? <span data-testid="form-error">{error.toString()}</span> : null)}
        </FieldError>
        <ObjectField name="person">
          <FieldError>
            {({ error }) =>
              error ? <span data-testid="person-error">{error.toString()}</span> : null
            }
          </FieldError>
          <FieldError name="firstName">
            {({ error }) =>
              error ? <span data-testid="firstName-error">{error.toString()}</span> : null
            }
          </FieldError>
          <FieldError name="lastName">
            {({ error }) => (error ? <span>{error.toString()}</span> : null)}
          </FieldError>
          <Field data-testid="firstName" name="firstName" />
          <Field data-testid="lastName" name="lastName" />
        </ObjectField>
      </Form>,
    );

    fireEvent.change(getByTestId('firstName'), { target: { value: 'a' } });

    act(() => jest.runAllTimers());

    fireEvent.submit(getByTestId('form'));

    // resolve validator
    await act(() => Promise.resolve());
    // resolve validation promise
    await act(() => Promise.resolve());

    expect(getByTestId('form-error').innerHTML).toBe('Root Error');

    fireEvent.submit(getByTestId('form'));

    // resolve validator
    await act(() => Promise.resolve());
    // resolve validation promise
    await act(() => Promise.resolve());

    expect(getByTestId('person-error').innerHTML).toBe('Object Error');

    fireEvent.submit(getByTestId('form'));

    // resolve validator
    await act(() => Promise.resolve());
    // resolve validation promise
    await act(() => Promise.resolve());

    expect(getByTestId('firstName-error').innerHTML).toBe('First name Error');
  });
});
