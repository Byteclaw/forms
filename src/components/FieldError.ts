import { ComponentProps, ComponentType, createElement, FC, forwardRef, ReactElement } from 'react';
import { useError, useParentField } from '../hooks';

interface FieldErrorRendererProps {
  error: string | undefined | { [key: string]: any };
}

interface FieldErrorRenderer {
  (props: FieldErrorRendererProps): ReactElement | null;
}

interface FieldErrorProps {
  children?: FieldErrorRenderer;
  /**
   * Defaults to "" means that it looks for root errors on field
   * In case of Object/Array/Form it means that the error for this field only will be rendered
   * And not for nested fields
   */
  name?: string;
}

interface FieldErrorComponent {
  <TAs extends keyof JSX.IntrinsicElements = any>(
    props: { as: TAs } & JSX.IntrinsicElements[TAs] & FieldErrorProps,
  ): ReactElement | null;
  <TAs extends ComponentType<{ error: string | undefined | { [key: string]: any } }> = FC<{}>>(
    props: { as: TAs } & ComponentProps<TAs> & FieldErrorProps,
  ): ReactElement | null;
  (props: FieldErrorProps): ReactElement | null;
  displayName?: string;
}

export const FieldError: FieldErrorComponent = forwardRef(
  (
    {
      as,
      children,
      name = '',
      ...restProps
    }: {
      as?:
        | keyof JSX.IntrinsicElements
        | ComponentType<{ error: string | undefined | { [key: string]: any } }>;
    } & FieldErrorProps,
    ref: any,
  ) => {
    const [parentField] = useParentField();
    const error = useError(name, parentField);

    if (typeof as === 'string') {
      if (typeof children !== 'function') {
        throw new Error('Children renderer must be provided');
      }

      return createElement(
        as,
        {
          ...restProps,
          ref,
        },
        children({ error }),
      );
    }

    if (as != null) {
      return createElement(
        as,
        {
          ...restProps,
          ref,
        } as any,
        typeof children === 'function' ? children({ error }) : null,
      );
    }

    if (typeof children !== 'function') {
      throw new Error('Chilren renderer must be provided');
    }

    return children({ error });
  },
);

FieldError.displayName = 'FieldError';
