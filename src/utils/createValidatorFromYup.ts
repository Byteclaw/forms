import * as yup from 'yup';
import { ValidationError } from '../hooks';

function splitPath(path: string): string[] {
  return path.replace(/[[\]]/g, '.').split(/\.+/);
}

export function createValidatorFromYup<
  TDefaultValue extends { [key: string]: any } = { [key: string]: any }
>(schema: yup.Schema<TDefaultValue>, options?: yup.ValidateOptions) {
  return <TValue extends { [key: string]: any } = TDefaultValue>(
    value: TValue,
  ): Promise<TDefaultValue | void> => {
    return schema.validate(value, options).catch(e => {
      if (yup.ValidationError.isError(e)) {
        throw new ValidationError([
          { path: e.path ? splitPath(e.path) : [], error: e.message },
          ...e.inner.map(innerError => ({
            path: innerError.path ? splitPath(innerError.path) : [],
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
