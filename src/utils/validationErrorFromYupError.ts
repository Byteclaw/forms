import * as yup from 'yup';
import { ValidationError } from '../hooks';

function splitPath(path: string): string[] {
  return path.replace(/[[\]]/g, '.').split(/\.+/);
}

export function validationErrorFromYupError(error: yup.ValidationError): ValidationError {
  return new ValidationError([
    { path: error.path ? splitPath(error.path) : [], error: error.message },
    ...error.inner.map(innerError => ({
      path: innerError.path ? splitPath(innerError.path) : [],
      error: innerError.message,
    })),
  ]);
}
