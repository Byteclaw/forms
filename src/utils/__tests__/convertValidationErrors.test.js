// @flow

import * as yup from 'yup';
import convertValidationErrors from '../convertValidationErrors';

describe('convertValidationErrors utility', () => {
  it('works correctly', async () => {
    const schema = yup
      .object()
      .noUnknown(true)
      .shape({
        email: yup
          .string()
          .email()
          .required('required'),
        password: yup.string().required('required'),
        arr: yup
          .array()
          .of(
            yup
              .object()
              .shape({
                color: yup
                  .string()
                  .typeError('string')
                  .required('required'),
              })
              .required('required'),
          )
          .required('required'),
      });

    await expect(schema.validate().catch(convertValidationErrors)).resolves.toEqual({
      password: 'required',
    });

    await expect(
      schema.validate(undefined, { abortEarly: false }).catch(convertValidationErrors),
    ).resolves.toEqual({
      arr: 'required',
      email: 'required',
      password: 'required',
    });

    await expect(
      schema
        .validate({ arr: [{ color: null }] }, { abortEarly: false })
        .catch(convertValidationErrors),
    ).resolves.toEqual({
      arr: {
        '0': {
          color: 'string',
        },
      },
      email: 'required',
      password: 'required',
    });
  });
});
