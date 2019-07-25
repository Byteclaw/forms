import { render } from '@testing-library/react';
import React from 'react';
import Field from '../Field';
import Form from '../Form';

describe('Field component', () => {
  it('forwards ref', async () => {
    const ref = jest.fn();

    render(
      <Form>
        <Field data-testid="email-input" ref={ref} debounceDelay={5} name="email" type="email" />
      </Form>,
    );

    expect(ref).toHaveBeenCalledTimes(1);
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
  });
});
