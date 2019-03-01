import { SyntheticEvent, useCallback, Dispatch } from 'react';
import * as yup from 'yup';
import { FormContext, FormFieldContext } from './formContext';
import useObjectField, { Field } from './useObjectField';
import { formReducer, FormActionEnum, FormAction, FormState } from './formReducer';
import { useMountedTracker } from './useMountedTracker';

type HandleSubmitFn = (e: SyntheticEvent<HTMLFormElement>) => Promise<any> | any;

interface IFormAPI {
  handleSubmit: HandleSubmitFn;
}

interface IFormComponents {
  FieldProvider: (typeof FormFieldContext)['Provider'];
  FormProvider: (typeof FormContext)['Provider'];
}

export type Form = Field<FormAction> & FormState & IFormAPI & IFormComponents;

const defaultValidator = yup.object();
const defaultInitialValue = {};

export default function useForm(
  initialValue: undefined | { [key: string]: any } = defaultInitialValue,
  onSubmit: (values: any) => Promise<any>,
  validator: yup.Schema<any> = defaultValidator,
  validateOnChange: boolean = false,
  enableReinitialize: boolean = false,
): Form {
  const mounted = useMountedTracker();

  const validate = useCallback(
    (value: any, dispatch: Dispatch<FormAction>): Promise<any> => {
      if (!validator) {
        return value;
      }

      dispatch({ type: FormActionEnum.VALIDATION_START });

      return validator.validate(value, { abortEarly: false }).then(
        val => {
          dispatch({ type: FormActionEnum.VALIDATION_SUCCESS });

          return val;
        },
        e => {
          dispatch({ type: FormActionEnum.VALIDATION_FAIL, error: e });

          throw e;
        },
      );
    },
    [validator],
  );
  const onChange = useCallback(
    (value: any, dispatch: Dispatch<FormAction>): Promise<any> => {
      if (!validateOnChange) {
        return value;
      }

      // catch the error because it is processed
      return validate(value, dispatch).catch(() => undefined);
    },
    [validate, validateOnChange],
  );
  const field = useObjectField<FormState, FormAction>(undefined, initialValue, undefined, {
    enableReinitialize,
    debounceDelay: 0,
    onChange: onChange as any,
    initialState: {
      changing: new Set(),
      dirty: new Set(),
      focused: new Set(),
      initialValue,
      errors: undefined,
      submitting: false,
      touched: new Set(),
      valid: true,
      validating: false,
      value: initialValue,
    },
    reducer: formReducer,
  });
  const handleSubmit = useCallback(
    (e: SyntheticEvent<HTMLFormElement>): Promise<void> | void => {
      e.preventDefault();

      if (field.changing || field.submitting || field.validating) {
        return;
      }

      // validate
      return validate(field.value, field.dispatch)
        .then((val: any) => {
          field.dispatch({ type: FormActionEnum.SUBMIT_START });

          return onSubmit(val);
        })
        .then(() => {
          // do nothing if form is unmounted
          if (!mounted.current) {
            return;
          }

          field.dispatch({ type: FormActionEnum.SUBMIT_SUCCESS });
        })
        .catch((err: any) => field.dispatch({ type: FormActionEnum.SUBMIT_FAIL, error: err }));
    },
    [
      onSubmit,
      field.dispatch,
      validate,
      field.changing,
      field.value,
      field.submitting,
      field.validating,
      mounted,
    ],
  );

  return {
    ...field,
    FieldProvider: field.Provider,
    FormProvider: FormContext.Provider,
    handleSubmit,
    valid: field.errors == null,
  };
}
