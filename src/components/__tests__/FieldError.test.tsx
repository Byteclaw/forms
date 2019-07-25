import { act, fireEvent, render } from '@testing-library/react';
// @ts-ignore
import React, { unstable_ConcurrentMode, ConcurrentMode, Fragment } from 'react';
import * as yup from 'yup';
import { ArrayField } from '../ArrayField';
import { Field } from '../Field';
import { FieldError, IFieldReadOnly } from '../FieldError';
import { Form } from '../Form';
import { FormProvider } from '../FormProvider';
import { ObjectField } from '../ObjectField';

const Concurrent = unstable_ConcurrentMode || ConcurrentMode;

describe.each([['SyncMode', 'div'], ['ConcurrentMode', Concurrent]])(
  'FieldError component (%s)',
  (_, Container) => {
    describe('Simple Form', () => {
      it('works correctly with render function', () => {
        const renderMock = jest.fn().mockReturnValue(<div />);
        const onSubmit = () => Promise.resolve();
        const validator: any = {
          validate() {
            return Promise.reject(
              new yup.ValidationError('test is a required field', null, 'test'),
            );
          },
        };
        const { getByTestId } = render(
          <Container>
            <Form data-testid="form" onSubmit={onSubmit} validationSchema={validator}>
              <Field data-testid="test-input" name="test" />
              <FieldError name="test">{renderMock}</FieldError>
              <FormProvider>
                {form => <span data-testid="validating">{form.validating.toString()}</span>}
              </FormProvider>
            </Form>
          </Container>,
        );

        expect(renderMock).toHaveBeenCalledWith({
          dirty: false,
          error: undefined,
          focused: false,
          touched: false,
          valid: true,
        });

        // touch the field
        fireEvent.focus(getByTestId('test-input'));

        // this is needed for concurrent mode (scheduler perhaps)
        act(() => jest.runAllTimers());

        expect(renderMock).toHaveBeenLastCalledWith({
          dirty: false,
          error: undefined,
          focused: true,
          touched: true,
          valid: true,
        });

        // blur the field
        fireEvent.blur(getByTestId('test-input'));

        // flush changes (concurrent mode only)
        act(() => jest.runAllTimers());

        expect(renderMock).toHaveBeenLastCalledWith({
          dirty: false,
          error: undefined,
          focused: false,
          touched: true,
          valid: true,
        });

        fireEvent.submit(getByTestId('form'));

        // validation and flush
        act(() => jest.runAllTimers());

        expect(getByTestId('validating').innerHTML).toBe('false');

        expect(renderMock).toHaveBeenLastCalledWith({
          dirty: false,
          error: 'test is a required field',
          focused: false,
          touched: true,
          valid: false,
        });
      });

      it('works correctly with component', () => {
        const onSubmit = () => Promise.resolve();
        const ErrSpan = ({ dirty, error, focused, touched, valid, ...rest }: IFieldReadOnly) => (
          <span {...rest}>{error || ''}</span>
        );
        const validator: any = {
          validate() {
            return Promise.reject(
              new yup.ValidationError('test is a required field', null, 'test'),
            );
          },
        };
        const { getByTestId } = render(
          <Container>
            <Form data-testid="form" onSubmit={onSubmit} validationSchema={validator}>
              <FieldError as={ErrSpan} data-testid="error-span" name="test" />
              <FormProvider>
                {form => (
                  <Fragment>
                    <span data-testid="validating">{form.validating.toString()}</span>
                    <span data-testid="valid">{form.valid.toString()}</span>
                  </Fragment>
                )}
              </FormProvider>
            </Form>
          </Container>,
        );

        expect(getByTestId('error-span').innerHTML).toBe('');

        fireEvent.submit(getByTestId('form'));

        act(() => {
          jest.runAllTimers();
        });

        expect(getByTestId('validating').innerHTML).toBe('false');
        expect(getByTestId('error-span').innerHTML).toBe('test is a required field');
      });
    });

    describe('Complex Form', () => {
      it('works correctly', () => {
        const onSubmitMock = jest.fn();
        const ErrSpan = ({ dirty, error, focused, touched, valid, ...rest }: IFieldReadOnly) => (
          <span {...rest}>{JSON.stringify(error)}</span>
        );
        const validator: any = {
          validate(...args: any[]) {
            return new Promise((res, rej) => {
              try {
                const validationSchema = yup
                  .object()
                  .shape({
                    arr: yup
                      .array()
                      .of(
                        yup
                          .object()
                          .shape({
                            person: yup.object().shape({
                              email: yup
                                .string()
                                .email('valid')
                                .required(),
                            }),
                          })
                          .required(),
                      )
                      .required(),
                  })

                  .required();

                // @ts-ignore
                res(validationSchema.validateSync(...args));
              } catch (e) {
                rej(e);
              }
            });
          },
        };
        const { getByTestId } = render(
          <Container>
            <Form data-testid="form" onSubmit={onSubmitMock} validationSchema={validator}>
              <FieldError as={ErrSpan} data-testid="form-error" name="" />
              <ArrayField name="arr">
                <ObjectField name={0}>
                  <ObjectField name="person">
                    <Field data-testid="email-input" name="email" type="email" />
                    <FieldError as={ErrSpan} data-testid="email-error" name="email" />
                  </ObjectField>
                  <FieldError as={ErrSpan} data-testid="person-error" name="person" />
                </ObjectField>
                <FieldError as={ErrSpan} data-testid="arr-0-error" name={0} />
              </ArrayField>
              <FieldError as={ErrSpan} data-testid="arr-error" name="arr" />
              <FormProvider>
                {form => (
                  <Fragment>
                    <span data-testid="errors">{JSON.stringify(form.errors)}</span>
                    <span data-testid="changing">{form.changing.toString()}</span>
                    <span data-testid="submitting">{form.submitting.toString()}</span>
                    <span data-testid="validating">{form.validating.toString()}</span>
                    <span data-testid="valid">{form.valid.toString()}</span>
                  </Fragment>
                )}
              </FormProvider>
            </Form>
          </Container>,
        );

        expect(getByTestId('form-error').innerHTML).toBe('');
        expect(getByTestId('arr-error').innerHTML).toBe('');
        expect(getByTestId('arr-0-error').innerHTML).toBe('');
        expect(getByTestId('email-error').innerHTML).toBe('');
        expect(getByTestId('person-error').innerHTML).toBe('');

        fireEvent.submit(getByTestId('form'));

        act(() => {
          jest.runAllTimers();
        });

        expect(getByTestId('validating').innerHTML).toBe('false');
        expect(getByTestId('valid').innerHTML).toBe('false');

        expect(getByTestId('errors').innerHTML).not.toBe('');
        expect(getByTestId('form-error').innerHTML).toBe('');
        expect(getByTestId('arr-error').innerHTML).toBe('"arr is a required field"');
        expect(getByTestId('arr-0-error').innerHTML).toBe('');
        expect(getByTestId('email-error').innerHTML).toBe('');
        expect(getByTestId('person-error').innerHTML).toBe('');

        fireEvent.change(getByTestId('email-input'), { target: { value: 'test' } });

        // resolves debounce on email input
        act(() => jest.runAllTimers());
        // resolves debounce on person field
        act(() => jest.runAllTimers());
        // resolves debounce on 0 field
        act(() => jest.runAllTimers());
        // resolves debounce on array field
        act(() => jest.runAllTimers());
        // resolved debounce on form
        act(() => jest.runAllTimers());

        // flush update (render in concurrent mode)
        act(() => jest.runAllTimers());

        expect(getByTestId('changing').innerHTML).toBe('false');

        fireEvent.submit(getByTestId('form'));

        act(() => jest.runAllTimers());

        expect(getByTestId('validating').innerHTML).toBe('false');
        expect(getByTestId('valid').innerHTML).toBe('false');

        expect(getByTestId('errors').innerHTML).not.toBe('');
        expect(getByTestId('form-error').innerHTML).toBe('');
        expect(getByTestId('arr-error').innerHTML).not.toBe('');
        expect(getByTestId('arr-0-error').innerHTML).not.toBe('');
        expect(getByTestId('email-error').innerHTML).toBe('"valid"');
        expect(getByTestId('person-error').innerHTML).not.toBe('');

        // and now cause global validation error
        fireEvent.change(getByTestId('email-input'), { target: { value: 'a@a.com' } });

        // resolves debounce on email input
        act(() => jest.runAllTimers());
        // resolves debounce on person field
        act(() => jest.runAllTimers());
        // resolves debounce on 0 field
        act(() => jest.runAllTimers());
        // resolves debounce on array field
        act(() => jest.runAllTimers());
        // resolved debounce on form
        act(() => jest.runAllTimers());

        // flush update (render in concurrent mode)
        act(() => jest.runAllTimers());

        expect(getByTestId('changing').innerHTML).toBe('false');

        onSubmitMock.mockImplementationOnce(() =>
          Promise.reject(new yup.ValidationError('submit error', null, '')),
        );

        fireEvent.submit(getByTestId('form'));

        act(() => jest.runAllTimers());

        expect(getByTestId('validating').innerHTML).toBe('false');
        expect(getByTestId('valid').innerHTML).toBe('false');
        expect(getByTestId('submitting').innerHTML).toBe('false');
        expect(getByTestId('form-error').innerHTML).toBe('"submit error"');
      });
    });
  },
);
