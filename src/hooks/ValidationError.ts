/* eslint-disable no-param-reassign */

function mapErrors(
  path: (string | number)[],
  error: string,
  parent: { [key: string]: any },
): { [key: string]: string | { [key: string]: any } } {
  if (path.length === 0) {
    parent[''] = error;
  } else if (path.length === 1) {
    parent[path[0]] = error;
  } else {
    parent[path[0]] = {};
    parent[path[0]] = mapErrors(path.slice(1), error, parent[path[0]]);
  }

  return parent;
}

export class ValidationError {
  errors: { [key: string]: string | { [key: string]: any } };

  constructor(errors: { path: (string | number)[]; error: string }[]) {
    this.errors = {};

    errors.forEach(err => mapErrors(err.path, err.error, this.errors));
  }
}
