import React, { Fragment } from 'react';
import { fireEvent, render, wait } from 'react-testing-library';
import * as yup from 'yup';
import Field from '../Field';
import FieldError from '../FieldError';
import Form from '../Form';
import FormProvider from '../FormProvider';

describe('Form component', () => {
  describe('validateOnChange prop', () => {
    const validator = yup.object().shape({
      email: yup
        .string()
        .email()
        .test(
          'async',
          'async test failed',
          () => new Promise(res => setTimeout(() => res(false), 10)),
        )
        .required(),
    });

    it('validates on change', async () => {
      const onSubmit = async () => undefined;
      const { getByTestId } = render(
        <Form onSubmit={onSubmit} validateOnChange={true} validationSchema={validator}>
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
        </Form>,
      );

      fireEvent.change(getByTestId('email-input'), { target: { value: 'a' } });

      await wait(() => expect(getByTestId('changing').innerHTML).toBe('true'));
      await wait(() => {
        expect(getByTestId('changing').innerHTML).toBe('false');
        expect(getByTestId('validating').innerHTML).toBe('true');
      });
      await wait(() => {
        expect(getByTestId('validating').innerHTML).toBe('false');
        expect(getByTestId('valid').innerHTML).toBe('false');
      });

      expect(getByTestId('email-error').innerHTML).toBe('async test failed');
    });

    xit('does not validate on change', async () => {
      const onSubmit = async () => undefined;
      const { getByTestId } = render(
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
        </Form>,
      );

      fireEvent.change(getByTestId('email-input'), { target: { value: 'a' } });

      await wait(() => expect(getByTestId('changing').innerHTML).toBe('true'));
      await wait(() => {
        expect(getByTestId('changing').innerHTML).toBe('false');
        expect(getByTestId('validating').innerHTML).toBe('false');
        expect(getByTestId('valid').innerHTML).toBe('true');
      });

      expect(getByTestId('email-error').innerHTML).toBe('');
    });
  });
});
