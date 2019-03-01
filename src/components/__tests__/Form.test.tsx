// @ts-ignore
import React, { unstable_ConcurrentMode, ConcurrentMode, Fragment } from 'react';
import { act, fireEvent, render } from 'react-testing-library';
import * as yup from 'yup';
import Field from '../Field';
import FieldError from '../FieldError';
import Form from '../Form';
import FormProvider from '../FormProvider';

const Concurrent = unstable_ConcurrentMode || ConcurrentMode;

describe.each([['SyncMode', 'div'] /*, ['ConcurrentMode', Concurrent]*/])(
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

    describe('enableReinitialize and initialValues props', () => {
      it('reinitializes form with new initialValues', () => {
        const onSubmit = jest.fn(() => Promise.resolve());
        const validator: any = {
          validate(values: any) {
            return Promise.resolve(values);
          },
        };
        let initialValues = {
          email: 'test@test.com',
        };
        const prepareApp = ({
          enableReinitialize = true,
          initialValues,
        }: {
          enableReinitialize?: boolean;
          initialValues: any;
        }) => (
          <Container>
            <Form
              data-testid="form"
              enableReinitialize={enableReinitialize}
              initialValues={initialValues}
              onSubmit={onSubmit}
              validationSchema={validator}
            >
              <Field data-testid="email-input" debounceDelay={5} name="email" type="email" />
              <FieldError name="email">
                {({ error }) => <span data-testid="email-error">{error || null}</span>}
              </FieldError>
              <FormProvider>
                {form => (
                  <Fragment>
                    <span data-testid="initialValue">{JSON.stringify(form.initialValue)}</span>
                    <span data-testid="value">{JSON.stringify(form.value)}</span>
                    <span data-testid="submitting">{form.submitting.toString()}</span>
                    <span data-testid="validating">{form.validating.toString()}</span>
                    <span data-testid="changing">{form.changing.toString()}</span>
                    <span data-testid="valid">{form.valid.toString()}</span>
                  </Fragment>
                )}
              </FormProvider>
            </Form>
          </Container>
        );
        const { getByTestId, rerender } = render(prepareApp({ initialValues }));

        expect((getByTestId('email-input') as HTMLInputElement).value).toBe('test@test.com');

        fireEvent.change(getByTestId('email-input'), { target: { value: 'test2@test.com' } });

        // flush changes (concurrent)
        act(() => jest.runAllTimers());

        expect(getByTestId('changing').innerHTML).toBe('true');

        // resolve debounce
        act(() => jest.runAllTimers());
        // flush changes
        act(() => jest.runAllTimers());

        expect(getByTestId('changing').innerHTML).toBe('false');
        expect((getByTestId('email-input') as HTMLInputElement).value).toBe('test2@test.com');

        expect(getByTestId('initialValue').innerHTML).toMatchInlineSnapshot(
          `"{\\"email\\":\\"test@test.com\\"}"`,
        );
        expect(getByTestId('value').innerHTML).toMatchInlineSnapshot(
          `"{\\"email\\":\\"test2@test.com\\"}"`,
        );

        // now rerender form with same values
        rerender(prepareApp({ initialValues }));

        expect((getByTestId('email-input') as HTMLInputElement).value).toBe('test2@test.com');

        expect(getByTestId('initialValue').innerHTML).toMatchInlineSnapshot(
          `"{\\"email\\":\\"test@test.com\\"}"`,
        );
        expect(getByTestId('value').innerHTML).toMatchInlineSnapshot(
          `"{\\"email\\":\\"test2@test.com\\"}"`,
        );

        // now reinitialize form with new initialValues
        // baasically only reference will change
        initialValues = { email: 'test@test.com' };

        rerender(prepareApp({ initialValues }));

        // value will be the same as changed value because initial values did not change
        expect((getByTestId('email-input') as HTMLInputElement).value).toBe('test2@test.com');

        expect(getByTestId('initialValue').innerHTML).toMatchInlineSnapshot(
          `"{\\"email\\":\\"test@test.com\\"}"`,
        );
        expect(getByTestId('value').innerHTML).toMatchInlineSnapshot(
          `"{\\"email\\":\\"test2@test.com\\"}"`,
        );

        initialValues = { email: 'test3@test.com' };

        rerender(prepareApp({ initialValues }));

        // value will change because initialValue will change from test@test.com to test3@test.com
        expect((getByTestId('email-input') as HTMLInputElement).value).toBe('test3@test.com');

        expect(getByTestId('initialValue').innerHTML).toMatchInlineSnapshot(
          `"{\\"email\\":\\"test3@test.com\\"}"`,
        );
        expect(getByTestId('value').innerHTML).toMatchInlineSnapshot(
          `"{\\"email\\":\\"test3@test.com\\"}"`,
        );

        // now reinitialize form but disable reinitialize
        initialValues = { email: 'test4@test.com' };

        rerender(prepareApp({ enableReinitialize: false, initialValues }));

        // value of input will stay the same
        // initial values will be the same as they were
        expect((getByTestId('email-input') as HTMLInputElement).value).toBe('test3@test.com');

        expect(getByTestId('initialValue').innerHTML).toMatchInlineSnapshot(
          `"{\\"email\\":\\"test4@test.com\\"}"`,
        );
        expect(getByTestId('value').innerHTML).toMatchInlineSnapshot(
          `"{\\"email\\":\\"test3@test.com\\"}"`,
        );
      });
    });
  },
);
