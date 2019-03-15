import * as yup from 'yup';
import { convertValidationErrors } from '../utils';
import { objectFieldReducer, ObjectFieldAction } from './objectFieldReducer';
import { FieldState } from './fieldReducer';

export enum FormActionEnum {
  SUBMIT_FAIL = 'SUBMIT_FAIL',
  SUBMIT_START = 'SUBMIT_START',
  SUBMIT_SUCCESS = 'SUBMIT_SUCCESS',
  VALIDATION_FAIL = 'VALIDATION_FAIL',
  VALIDATION_START = 'VALIDATION_START',
  VALIDATION_SUCCESS = 'VALIDATION_SUCCESS',
}

type SubmitStartAction = {
  type: FormActionEnum.SUBMIT_START;
};

type SubmitSuccessAction = {
  type: FormActionEnum.SUBMIT_SUCCESS;
};

type SubmitFailAction = {
  type: FormActionEnum.SUBMIT_FAIL;
  error: yup.ValidationError | Error | any;
};

type ValidationFailAction = {
  type: FormActionEnum.VALIDATION_FAIL;
  error: yup.ValidationError | Error | any;
};

type ValidationStartAction = {
  type: FormActionEnum.VALIDATION_START;
};

type ValidationSuccessAction = {
  type: FormActionEnum.VALIDATION_SUCCESS;
};

export type FormAction =
  | ObjectFieldAction
  | SubmitFailAction
  | SubmitStartAction
  | SubmitSuccessAction
  | ValidationFailAction
  | ValidationStartAction
  | ValidationSuccessAction;

export interface FormState<TValue = any> extends FieldState<TValue> {
  errors: { [field: string]: any } | string | undefined;
  submitting: boolean;
  valid: boolean;
  validating: boolean;
}

function castError(err: yup.ValidationError | Error | any): { [key: string]: string } {
  if (yup.ValidationError.isError(err)) {
    return convertValidationErrors(err);
  }

  return {
    '': err instanceof Error ? err.message : '' + err,
  };
}

export function formReducer(
  state: FormState<{ [key: string]: any }>,
  action: FormAction,
): FormState<{ [key: string]: any }> {
  switch (action.type) {
    case FormActionEnum.SUBMIT_START: {
      return {
        ...state,
        submitting: true,
      };
    }
    case FormActionEnum.SUBMIT_FAIL: {
      return {
        ...state,
        errors: castError(action.error),
        submitting: false,
      };
    }
    case FormActionEnum.SUBMIT_SUCCESS: {
      return {
        ...state,
        submitting: false,
      };
    }
    case FormActionEnum.VALIDATION_START: {
      return {
        ...state,
        validating: true,
      };
    }
    case FormActionEnum.VALIDATION_FAIL: {
      return {
        ...state,
        errors: castError(action.error),
        valid: false,
        validating: false,
      };
    }
    case FormActionEnum.VALIDATION_SUCCESS: {
      return {
        ...state,
        errors: undefined,
        valid: true,
        validating: false,
      };
    }
    default: {
      return objectFieldReducer(state, action) as FormState<{
        [key: string]: any;
      }>;
    }
  }
}
