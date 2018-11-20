// @flow
/* eslint-disable import/prefer-default-export */

import { createContext, type Context } from 'react';
import type { Form } from './useForm';
import type { Field as ArrayField } from './useArrayField';
import type { Field as ObjectField } from './useObjectField';

export const FormFieldContext: Context<ArrayField | Form | ObjectField> = createContext(({}: any));
