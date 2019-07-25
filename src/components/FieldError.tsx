import { ComponentType, createElement, ReactElement, ReactNode } from 'react';
import { useConnectedField, IFieldReadOnly } from '../hooks/useConnectedField';

interface IProps {
  as?: null | string | ComponentType<any>;
  children?: (state: IFieldReadOnly) => ReactNode;
  name: number | string;
}

export function FieldError({ as = null, children, name, ...rest }: IProps) {
  const fieldState = useConnectedField(name);

  if (as != null && children == null) {
    return createElement(as, { ...rest, ...fieldState });
  }

  if (children != null) {
    return children(fieldState) as ReactElement<any> | null;
  }

  return null;
}
