import * as yup from 'yup';
import { ValidationError } from '../hooks';
import { validationErrorFromYupError } from './validationErrorFromYupError';

export function createValidatorFromYup<
  TDefaultValue extends { [key: string]: any } = { [key: string]: any }
>(schema: yup.Schema<TDefaultValue>, options?: yup.ValidateOptions) {
  return <TValue extends { [key: string]: any } = TDefaultValue>(
    value: TValue,
  ): Promise<TDefaultValue | void> => {
    return schema.validate(value, options).catch(e => {
      if (yup.ValidationError.isError(e)) {
        throw validationErrorFromYupError(e);
      } else if (e instanceof Error) {
        throw new ValidationError([{ path: [], error: e.message }]);
      }

      throw new ValidationError([{ path: [], error: '' + e }]);
    });
  };
}
