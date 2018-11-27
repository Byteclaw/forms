import { ValidationError } from 'yup';

function dottedPath(path: string): string[] {
  return path.match(/([^[\].])+/g) || [''];
}

function set(path: string[], error: string, value: { [key: string]: any }): { [key: string]: any } {
  if (path.length === 1) {
    return { ...value, [path[0]]: error };
  }
  if (path.length > 1) {
    return {
      ...value,
      [path[0]]: set(path.slice(1), error, value[path[0]] || {}),
    };
  }

  return value;
}

export default function convertValidationErrors(error: ValidationError): { [key: string]: any } {
  if (error.inner == null || error.inner.length === 0) {
    return set(dottedPath(error.path || ''), error.message, {});
  }

  return error.inner.reduce(
    (errors, innerError) => set(dottedPath(innerError.path), innerError.message, errors),
    {},
  );
}
