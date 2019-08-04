import * as yup from 'yup';
import { ValidationError } from '../hooks';

export function createValidatorFromYup<
  TDefaultValue extends { [key: string]: any } = { [key: string]: any }
>(schema: yup.Schema<TDefaultValue>, options?: yup.ValidateOptions) {
  return <TValue extends { [key: string]: any } = TDefaultValue>(value: TValue): Promise<void> => {
    return schema
      .validate(value, options)
      .then(() => {})
      .catch(e => {
        if (yup.ValidationError.isError(e)) {
          throw new ValidationError([
            { path: e.path ? e.path.split('.') : [], error: e.message },
            ...e.inner.map(innerError => ({
              path: innerError.path ? innerError.path.split('.') : [],
              error: innerError.message,
            })),
          ]);
        } else if (e instanceof Error) {
          throw new ValidationError([{ path: [], error: e.message }]);
        }

        throw new ValidationError([{ path: [], error: '' + e }]);
      });
  };
}
