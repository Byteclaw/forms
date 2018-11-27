import { SyntheticEvent, useCallback, useState } from 'react';
import * as yup from 'yup';
import convertValidationErrors from '../utils/convertValidationErrors';
import { FormContext, FormFieldContext } from './formContext';
import useObjectField, { Field } from './useObjectField';

type HandleSubmitFn = (e: SyntheticEvent<HTMLFormElement>) => Promise<any>;

export interface IFormState {
  errors: { [key: string]: string };
  submitting: boolean;
  valid: boolean;
  validating: boolean;
}

interface IFormAPI {
  handleSubmit: HandleSubmitFn;
}

interface IFormComponents {
  FieldProvider: (typeof FormFieldContext)['Provider'];
  FormProvider: (typeof FormContext)['Provider'];
}

export type Form = Field & IFormState & IFormAPI & IFormComponents;

type ValidationFn = (values: any) => Promise<any | Error>;

export default function useForm(
  initialValue: undefined | { [key: string]: any },
  onSubmit: (values: any) => Promise<any>,
  validator: yup.Schema<any>,
  validateOnChange: boolean = false,
): Form {
  const [formState, setFormState] = useState({
    errors: {},
    submitting: false,
    valid: true,
    validating: false,
  });
  const processError = useCallback(
    (err: yup.ValidationError, extraState?: object) => {
      const errors = {
        '': err.message,
      };
      const isYupError: boolean = (yup.ValidationError as any).isError(err);

      setFormState(current => ({
        ...current,
        errors: isYupError ? convertValidationErrors(err) : errors,
        valid: !isYupError,
        validating: false,
        ...extraState,
      }));
    },
    [setFormState],
  );
  const validate = useCallback(
    async value => {
      if (!validator) {
        return value;
      }

      try {
        setFormState(current => ({ ...current, validating: true }));

        const values = await validator.validate(value, { abortEarly: false });

        setFormState(current => ({ ...current, errors: {}, valid: true, validating: false }));

        return values;
      } catch (e) {
        processError(e);

        throw e;
      }
    },
    [setFormState, processError, validator],
  );
  const onChange = useCallback(
    async value => {
      if (!validateOnChange) {
        return value;
      }

      // catch the error because it is processed
      return validate(value).catch(() => undefined);
    },
    [validate, validateOnChange],
  );
  const field = useObjectField(undefined, initialValue, formState.errors, {
    debounceDelay: 0,
    onChange,
  });
  const handleSubmit = useCallback(
    async (e: SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (field.changing || formState.submitting || formState.validating) {
        return;
      }

      try {
        // do not catch error using .catch but throw it so we can process it
        // and set form as not submitting
        const values = await validate(field.value);

        setFormState(current => ({ ...current, submitting: true }));

        await onSubmit(values);

        setFormState(current => ({ ...current, submitting: false }));
      } catch (err) {
        processError(err, { submitting: false });
      }
    },
    [
      onSubmit,
      setFormState,
      validate,
      field.changing,
      field.value,
      formState.submitting,
      formState.validating,
    ],
  );

  return {
    ...field,
    ...formState,
    FieldProvider: field.Provider,
    FormProvider: FormContext.Provider,
    handleSubmit,
  };
}
