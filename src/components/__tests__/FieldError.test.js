// @flow

import * as yup from 'yup';
import React, { Fragment } from 'react';
import { fireEvent, render, wait } from 'react-testing-library';
import ArrayField from '../ArrayField';
import Field from '../Field';
import FieldError from '../FieldError';
import Form from '../Form';
import FormProvider from '../FormProvider';
import ObjectField from '../ObjectField';

describe('FieldError component', () => {
  describe('simple form', () => {
    it('works correctly with render function', async () => {
      const renderMock = jest.fn().mockReturnValue(<div />);
      const { getByTestId } = render(
        <Form
          data-testid="form"
          onSubmit={async () => {}}
          validationSchema={yup
            .object()
            .shape({ test: yup.string().required() })
            .required()}
        >
          <Field data-testid="test-input" name="test" />
          <FieldError name="test">{renderMock}</FieldError>
          <FormProvider>
            {form => <span data-testid="validating">{form.validating.toString()}</span>}
          </FormProvider>
        </Form>,
      );

      expect(renderMock).toHaveBeenCalledTimes(2);
      expect(renderMock).toHaveBeenCalledWith({
        dirty: false,
        error: undefined,
        focused: false,
        touched: false,
        valid: true,
      });

      // touch the field
      fireEvent.focus(getByTestId('test-input'));

      expect(renderMock).toHaveBeenCalledTimes(3);
      expect(renderMock).toHaveBeenLastCalledWith({
        dirty: false,
        error: undefined,
        focused: true,
        touched: true,
        valid: true,
      });

      // blur the field
      fireEvent.blur(getByTestId('test-input'));

      expect(renderMock).toHaveBeenCalledTimes(4);
      expect(renderMock).toHaveBeenLastCalledWith({
        dirty: false,
        error: undefined,
        focused: false,
        touched: true,
        valid: true,
      });

      fireEvent.submit(getByTestId('form'));

      await wait(() => expect(getByTestId('validating').innerHTML).toBe('false'));

      expect(renderMock).toHaveBeenCalledTimes(6);
      expect(renderMock).toHaveBeenLastCalledWith({
        dirty: false,
        error: 'test is a required field',
        focused: false,
        touched: true,
        valid: false,
      });
    });

    it('works correctly with component', async () => {
      const ErrSpan = ({ error, ...rest }: { error: ?string }) => <span {...rest}>{error}</span>;
      const { getByTestId } = render(
        <Form
          data-testid="form"
          onSubmit={async () => {}}
          validationSchema={yup
            .object()
            .shape({ test: yup.string().required() })
            .required()}
        >
          <FieldError as={ErrSpan} data-testid="error-span" name="test" />
          <FormProvider>
            {form => (
              <Fragment>
                <span data-testid="validating">{form.validating.toString()}</span>
                <span data-testid="valid">{form.valid.toString()}</span>
              </Fragment>
            )}
          </FormProvider>
        </Form>,
      );

      expect(getByTestId('error-span').innerHTML).toBe('');

      fireEvent.submit(getByTestId('form'));

      await wait(() => expect(getByTestId('validating').innerHTML).toBe('false'));

      expect(getByTestId('error-span').innerHTML).toBe('test is a required field');
    });
  });

  describe('complex form', () => {
    it('works correctly', async () => {
      const onSubmitMock = jest.fn();
      const ErrSpan = ({ error, ...rest }: { error: ?string }) => (
        <span {...rest}>{JSON.stringify(error)}</span>
      );
      const { getByTestId } = render(
        <Form
          data-testid="form"
          onSubmit={onSubmitMock}
          validationSchema={yup
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

            .required()}
        >
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
        </Form>,
      );

      expect(getByTestId('form-error').innerHTML).toBe('');
      expect(getByTestId('arr-error').innerHTML).toBe('');
      expect(getByTestId('arr-0-error').innerHTML).toBe('');
      expect(getByTestId('email-error').innerHTML).toBe('');
      expect(getByTestId('person-error').innerHTML).toBe('');

      fireEvent.submit(getByTestId('form'));

      await wait(() => {
        expect(getByTestId('validating').innerHTML).toBe('false');
        expect(getByTestId('valid').innerHTML).toBe('false');
      });

      expect(getByTestId('errors').innerHTML).not.toBe('');
      expect(getByTestId('form-error').innerHTML).toBe('');
      expect(getByTestId('arr-error').innerHTML).toBe('"arr is a required field"');
      expect(getByTestId('arr-0-error').innerHTML).toBe('');
      expect(getByTestId('email-error').innerHTML).toBe('');
      expect(getByTestId('person-error').innerHTML).toBe('');

      fireEvent.change(getByTestId('email-input'), { target: { value: 'test' } });

      await wait(() => expect(getByTestId('changing').innerHTML).toBe('false'));

      fireEvent.submit(getByTestId('form'));

      await wait(() => {
        expect(getByTestId('validating').innerHTML).toBe('false');
        expect(getByTestId('valid').innerHTML).toBe('false');
      });

      expect(getByTestId('errors').innerHTML).not.toBe('');
      expect(getByTestId('form-error').innerHTML).toBe('');
      expect(getByTestId('arr-error').innerHTML).not.toBe('');
      expect(getByTestId('arr-0-error').innerHTML).not.toBe('');
      expect(getByTestId('email-error').innerHTML).toBe('"valid"');
      expect(getByTestId('person-error').innerHTML).not.toBe('');

      // and now cause global validation error
      fireEvent.change(getByTestId('email-input'), { target: { value: 'a@a.com' } });

      await wait(() => expect(getByTestId('changing').innerHTML).toBe('false'));

      onSubmitMock.mockImplementationOnce(() =>
        Promise.reject(new yup.ValidationError('submit error', null, '')),
      );

      fireEvent.submit(getByTestId('form'));

      await wait(() => {
        expect(getByTestId('validating').innerHTML).toBe('false');
        expect(getByTestId('valid').innerHTML).toBe('false');
        expect(getByTestId('submitting').innerHTML).toBe('false');
      });

      expect(getByTestId('form-error').innerHTML).toBe('"submit error"');
    });
  });
});
