// @ts-ignore
import React, { unstable_ConcurrentMode, ConcurrentMode, Fragment } from 'react';
import { act, fireEvent, render } from 'react-testing-library';
import * as yup from 'yup';
import Field from '../Field';
import FieldError from '../FieldError';
import Form from '../Form';
import FormProvider from '../FormProvider';

const Concurrent = unstable_ConcurrentMode || ConcurrentMode;

describe.each([['SyncMode', 'div'], ['ConcurrentMode', Concurrent]])(
  'Form component (%s)',
  (_, Container) => {
    describe('validateOnChange prop', () => {
      const validator: any = {
        validate() {
          return Promise.reject(new yup.ValidationError('async test failed', null, 'email'));
        },
      };

      it('validates on change', () => {
        const onSubmit = async () => undefined;
        const { getByTestId } = render(
          <Container>
            <Form onSubmit={onSubmit} validateOnChange validationSchema={validator}>
              <Field data-testid="email-input" debounceDelay={5} name="email" type="email" />
              <FieldError name="email">
                {({ error }) => <span data-testid="email-error">{error || null}</span>}
              </FieldError>
              <FormProvider>
                {form => (
                  <Fragment>
                    <span data-testid="validating">{form.validating.toString()}</span>
                    <span data-testid="changing">{form.changing.toString()}</span>
                    <span data-testid="valid">{form.valid.toString()}</span>
                  </Fragment>
                )}
              </FormProvider>
            </Form>
          </Container>,
        );

        fireEvent.change(getByTestId('email-input'), { target: { value: 'a' } });

        // flush changes (concurrent)
        act(() => jest.runAllTimers());

        expect(getByTestId('changing').innerHTML).toBe('true');

        // resolve debounce and validation
        act(() => jest.runAllTimers());

        // flush changes (concurrent)
        act(() => jest.runAllTimers());

        expect(getByTestId('changing').innerHTML).toBe('false');
        expect(getByTestId('validating').innerHTML).toBe('false');
        expect(getByTestId('email-error').innerHTML).toBe('async test failed');
      });

      it('does not validate on change', () => {
        const onSubmit = async () => undefined;
        const { getByTestId } = render(
          <Container>
            <Form onSubmit={onSubmit} validationSchema={validator}>
              <Field data-testid="email-input" debounceDelay={5} name="email" type="email" />
              <FieldError name="email">
                {({ error }) => <span data-testid="email-error">{error || null}</span>}
              </FieldError>
              <FormProvider>
                {form => (
                  <Fragment>
                    <span data-testid="validating">{form.validating.toString()}</span>
                    <span data-testid="changing">{form.changing.toString()}</span>
                    <span data-testid="valid">{form.valid.toString()}</span>
                  </Fragment>
                )}
              </FormProvider>
            </Form>
          </Container>,
        );

        fireEvent.change(getByTestId('email-input'), { target: { value: 'a' } });

        // flush changes (concurrent)
        act(() => jest.runAllTimers());

        expect(getByTestId('changing').innerHTML).toBe('true');

        // resolves debounce on email input
        act(() => jest.runTimersToTime(5));
        // resolves debounce on form
        act(() => jest.runTimersToTime(10));
        // flush pending changes
        act(() => jest.runAllTimers());
        act(() => jest.runAllTimers());

        expect(getByTestId('changing').innerHTML).toBe('false');
        expect(getByTestId('validating').innerHTML).toBe('false');
        expect(getByTestId('valid').innerHTML).toBe('true');

        expect(getByTestId('email-error').innerHTML).toBe('');
      });
    });
  },
);
