# @napred/forms

[![CircleCI](https://circleci.com/gh/napred/forms/tree/master.svg?style=svg&circle-token=cff0c20cd6bc5d6d12264982df589e8717a72fd0)](https://circleci.com/gh/napred/forms/tree/master)
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors)

Easily create complex forms in [React](https://github.com/facebook/react).

## Installation

```console
npm install @napred/forms yup

# or using yarn

yarn add @napred/forms yup
```

## Requirements

- `react >= 16.7.0`

## Up and running example

```js
import { Fragment } from 'react';
import { ArrayField, Field, Form, FormProvider, ObjectField } from '@napred/forms';
import * as yup from 'yup';

const validator = yup.object().shape({
  productTitle: yup.string().required(),
  images: yup
    .array()
    .of(
      yup.object().shape({
        title: yup.string().required(),
        url: yup
          .string()
          .url()
          .required(),
      }),
    )
    .required(),
  attributes: yup.object().shape({
    color: yup
      .string()
      .matches(/^#[0-9a-fA-F]{6}$/)
      .required(),
  }),
});

<Form onSubmit={async values => {}} validationSchema={validator}>
  {/* global error of form */}
  <FieldError name="">{({ error }) => error || null}</FieldError>
  <Field name="productTitle" />
  <FieldError name="productTitle">{({ error }) => error || null}</FieldError>
  <ArrayField name="images">
    {({ value, addItem, removeItem }) => (
      <Fragment>
        {/* value can be undefined/null if is not initialized */}
        {(value || []).map((val, i) => (
          <ObjectField name={i}>
            <Field name="url" type="url" />
            <FieldError name="url">{({ error }) => error || null}</FieldError>
            <Field name="title" />
            <FieldError name="title">{({ error }) => error || null}</FieldError>
            <button onClick={() => removeItem(i)} type="button">
              Remove
            </button>
          </ObjectField>
        ))}
        <button onClick={() => addItem()} type="button">
          Add image
        </button>
      </Fragment>
    )}
  </ArrayField>
  <FieldError name="images">{({ error }) => error || null}</FieldError>
  <ObjectField name="attributes">
    <Field name="color" />
    <FieldError name="color">{({ error }) => error || null}</FieldError>
  </ObjectField>
  <FieldError name="attributes">{({ error }) => error || null}</FieldError>
  <FormProvider>
    {form => (
      <button disabled={form.changing || form.submitting || form.validating} type="submit">
        Save
      </button>
    )}
  </FormProvider>
</Form>;
```

## Examples

- [Simple Form](./examples/SimpleForm.md)

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars1.githubusercontent.com/u/174716?v=4" width="100px;"/><br /><sub><b>Michal Kvasničák</b></sub>](https://github.com/michalkvasnicak)<br />[💬](#question-michalkvasnicak "Answering Questions") [💻](https://github.com/napred/@napred/forms/commits?author=michalkvasnicak "Code") [🎨](#design-michalkvasnicak "Design") [📖](https://github.com/napred/@napred/forms/commits?author=michalkvasnicak "Documentation") [💡](#example-michalkvasnicak "Examples") [🤔](#ideas-michalkvasnicak "Ideas, Planning, & Feedback") [👀](#review-michalkvasnicak "Reviewed Pull Requests") [⚠️](https://github.com/napred/@napred/forms/commits?author=michalkvasnicak "Tests") | [<img src="https://avatars1.githubusercontent.com/u/373788?v=4" width="100px;"/><br /><sub><b>Juraj Hríb</b></sub>](https://github.com/jurajhrib)<br />[💬](#question-jurajhrib "Answering Questions") [🐛](https://github.com/napred/@napred/forms/issues?q=author%3Ajurajhrib "Bug reports") [💻](https://github.com/napred/@napred/forms/commits?author=jurajhrib "Code") [📖](https://github.com/napred/@napred/forms/commits?author=jurajhrib "Documentation") [🤔](#ideas-jurajhrib "Ideas, Planning, & Feedback") [👀](#review-jurajhrib "Reviewed Pull Requests") |
| :---: | :---: |

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

## License

MIT License
