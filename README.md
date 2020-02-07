# @byteclaw/forms

![CircleCI](https://img.shields.io/circleci/project/github/Byteclaw/forms/master.svg?style=flat-square)
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors)
![Version](https://img.shields.io/npm/v/@byteclaw/forms.svg?style=flat-square)
![License](https://img.shields.io/npm/l/@byteclaw/forms.svg?style=flat-square)

Easily create complex forms in [React](https://github.com/facebook/react).

- [Installation](#installation)
- [Yup compatibility](#yup-compatibility)
- [Requirements](#requirements)
- [Up and running example](#up-and-running-example)
- [API](#api)
  - [Form](#form)
  - [Field](#field)
  - [FieldError](#field-error)
  - [ArrayField](#array-field)
  - [ObjectField](#object-field)
  - [ValidationError](#validation-error)
  - [useArrayField](#use-array-field)
  - [useDebouncedCallback](#use-debounced-callback)
  - [useError](#use-error)
  - [useField](#use-field)
  - [useForm](#use-form)
  - [useFormState](#use-form-state)
  - [useObjectField](#use-object-field)
  - [useParentField](#use-parent-field)
  - [useValues](#use-values)
  - [createValidatorFromYup](#create-validator-from-yup)
  - [validationErrorFromYupError](#validation-error-from-yup-error)
- [Examples](#examples)
- [Contributions](#contributions)

## Installation

```console
npm install @byteclaw/forms

# or using yarn

yarn add @byteclaw/forms
```

## Yup compatibility

This library supports [Yup](https://github.com/jquense/yup) validation library. In order to use it please install [Yup](https://github.com/jquense/yup) because it isn't a part of this library.

## Requirements

- `react >= 16.8.3`

## Up and running example

```js
import { Fragment } from 'react';
import {
  ArrayField,
  Field,
  Form,
  FormProvider,
  ObjectField,
  createValidatorFromYup,
} from '@byteclaw/forms';
import * as yup from 'yup';

const validator = createValidatorFromYup(
  yup.object().shape({
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
  }),
);

<Form onSubmit={async values => {}} onValidate={validator}>
  {/* global error of form */}
  <FieldError>{({ error }) => error || null}</FieldError>
  <Field name="productTitle" />
  <FieldError name="productTitle">{({ error }) => error || null}</FieldError>
  <ArrayField name="images">
    {({ value }, dispatch) => (
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
        <button onClick={() => dispatch({ type: 'CHANGE', value: [...value, {}] })} type="button">
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
      <button disabled={form.status !== 'IDLE'} type="submit">
        Save
      </button>
    )}
  </FormProvider>
</Form>;
```

## API

### [Form](./src/components/Form.tsx)

`Form` component is a root component necessary to use Forms at all. It provides a context for all fields in a given form.

Form accepts `onValidate`, `onSubmit` and `validateOnChange` props along with standard attributes accepted by `<form />`.

- `onValidate<TValues>(values?: TValues): Promise<TValues | void>`
  - optional validation function
  - in case of an error please throw [`ValidationError`](#validation-error) provided by this library
- `onSubmit<TValues>(values: TValues): Promise<void>`
  - optional submit function
  - it can validate form too, in case of an error throw [`ValidationError`](#validation-error) provided by this library
- `onChange<TValues>(values: TValues): Promise<void>`
  - optional on change function
- `validateOnChange`
  - default is `false`
  - optional
  - will validate form on change

### [FormProvider](./src/components/FormProvider.ts)

`FormProvider` is a way to connect to `FormState` when you need to react on something.

- `children: (state: FormState) => any`

### [Field](./src/components/Field.ts)

`Field` is a base component to construct simple widgets using `<input />` elements. On change is debounced.

### [FieldError](./src/components/FieldError.ts)

`FieldError` is a base component if you want to render validation errors that are connected with a specific field or a form root.

To connect to a root of ObjectField/ArrayField/Form use it like this:

```jsx
<FieldError name="">{err => JSON.stringify(err, null, ' ')}<FieldError>
```

Or specify `name` as a name that was used by `Field` component.

### [ArrayField](./src/components/ArrayField.tsx)

`ArrayField` is a base component to construct complex fields for array values.

### [ObjectField](./src/components/ObjectField.tsx)

`ObjectField` is a base component to construct nested objects in your form.

### [ValidationError](./src/components/ValidationError.ts)

`ValidationError` is a way how to map errors to fields in your form.

### [useArrayField](./src/hooks/useArrayField.ts)

### [useDebouncedCallback](./src/hooks/useDebouncedCallback.ts)

### [useError](./src/hooks/useError.ts)

### [useForm](./src/hooks/useForm.ts)

### [useField](./src/hooks/useField.ts)

### [useFormState](./src/hooks/useFormState.ts)

### [useObjectField](./src/hooks/useObjectField.ts)

### [useParentField](./src/hooks/useParentField.ts)

### [useValues](./src/hooks/useValues.ts)

### [createValidationErrorFromYup](./src/utils/createValidationErrorFromYup.ts)

### [validationErrorFromYupError](./src/utils/validationErrorFromYupError.ts)

## Examples

- [Simple Form](./examples/SimpleForm.md)

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars1.githubusercontent.com/u/174716?v=4" width="100px;"/><br /><sub><b>Michal Kvasničák</b></sub>](https://github.com/michalkvasnicak)<br />[💬](#question-michalkvasnicak "Answering Questions") [💻](https://github.com/byteclaw/@byteclaw/forms/commits?author=michalkvasnicak "Code") [🎨](#design-michalkvasnicak "Design") [📖](https://github.com/byteclaw/@byteclaw/forms/commits?author=michalkvasnicak "Documentation") [💡](#example-michalkvasnicak "Examples") [🤔](#ideas-michalkvasnicak "Ideas, Planning, & Feedback") [👀](#review-michalkvasnicak "Reviewed Pull Requests") [⚠️](https://github.com/byteclaw/@byteclaw/forms/commits?author=michalkvasnicak "Tests") | [<img src="https://avatars1.githubusercontent.com/u/373788?v=4" width="100px;"/><br /><sub><b>Juraj Hríb</b></sub>](https://github.com/jurajhrib)<br />[💬](#question-jurajhrib "Answering Questions") [🐛](https://github.com/byteclaw/@byteclaw/forms/issues?q=author%3Ajurajhrib "Bug reports") [💻](https://github.com/byteclaw/@byteclaw/forms/commits?author=jurajhrib "Code") [📖](https://github.com/byteclaw/@byteclaw/forms/commits?author=jurajhrib "Documentation") [🤔](#ideas-jurajhrib "Ideas, Planning, & Feedback") [👀](#review-jurajhrib "Reviewed Pull Requests") |
| :---: | :---: |

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

## License

MIT License
