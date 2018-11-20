// @flow

import { createElement, type ComponentType, type Node } from 'react';
import useConnectedField, { type Field } from '../hooks/useConnectedField';

type Props = {
  as: ?(string | ComponentType<any>),
  children?: (state: Field) => Node,
  name: number | string,
};

export default function FieldError({ as, children, name, ...rest }: Props) {
  const fieldState = useConnectedField(name);

  if (as != null && children == null) {
    return createElement(as, { ...rest, ...fieldState });
  }

  if (children != null) {
    return children(fieldState);
  }

  return null;
}

FieldError.defaultProps = {
  as: null,
};
