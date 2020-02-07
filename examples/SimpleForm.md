# Simple Form

Simple login form with `email` and `password` fields and validator.

[![Edit xjpqq1ro04](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/xjpqq1ro04)

```js
import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Field, FieldError, Form, FormProvider, createValidatorFromYup } from '@byteclaw/forms';
import { object, string } from 'yup';

const validate = createValidatorFromYup(
  object()
    .noUnknown(true)
    .shape({
      email: string()
        .email()
        .required(),
      password: string()
        .trim()
        .required(),
    }),
);

function App() {
  return (
    <div>
      <h1>Simple form</h1>
      <Form
        style={{ display: 'flex', flexDirection: 'column', width: 400 }}
        onSubmit={async values => alert(JSON.stringify(values, null, '  '))}
        onValidate={validate}
      >
        <FieldError>{({ error }) => error || null}</FieldError>
        <Field name="email" placeholder="email" type="email" />
        <FieldError name="email">{({ error }) => error || null}</FieldError>
        <Field name="password" placeholder="password" type="password" />
        <FieldError name="password">{({ error }) => error || null}</FieldError>
        <FormProvider>
          {form => <button disabled={form.status !== 'IDLE'}>Log in</button>}
        </FormProvider>
      </Form>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
```
