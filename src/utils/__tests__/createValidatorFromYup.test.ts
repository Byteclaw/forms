import * as yup from 'yup';
import { createValidatorFromYup } from '../createValidatorFromYup';
import { ValidationError } from '../../hooks';

describe('createValidatorFromYup', () => {
  it('works correctly', async () => {
    const schema = yup
      .object()
      .noUnknown(true)
      .shape({
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
                test: yup
                  .string()
                  .typeError('string')
                  .required('required'),
              })
              .required('required'),
          )
          .required('required'),
        email: yup
          .string()
          .email()
          .required('required'),
        password: yup.string().required('required'),
      });

    const onValidate = createValidatorFromYup(schema);
    const onValidateAll = createValidatorFromYup(schema, { abortEarly: false });

    await expect(onValidate({})).rejects.toEqual(
      new ValidationError([{ path: ['password'], error: 'required' }]),
    );
    await expect(onValidateAll({})).rejects.toEqual(
      new ValidationError([
        { path: [''], error: '3 errors occurred' },
        { path: ['arr'], error: 'required' },
        { path: ['password'], error: 'required' },
        { path: ['email'], error: 'required' },
      ]),
    );
    await expect(
      onValidate({ arr: [{ color: '#fff', test: 't' }], email: 'test@test.com', password: 'test' }),
    ).resolves.toEqual({
      arr: [{ color: '#fff', test: 't' }],
      email: 'test@test.com',
      password: 'test',
    });
    await expect(onValidateAll({ arr: [{}] })).rejects.toEqual(
      new ValidationError([
        { path: [''], error: '4 errors occurred' },
        { path: ['arr', 0, 'color'], error: 'required' },
        { path: ['arr', 0, 'test'], error: 'required' },
        { path: ['password'], error: 'required' },
        { path: ['email'], error: 'required' },
      ]),
    );
  });
});
