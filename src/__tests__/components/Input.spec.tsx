import React from 'react';

import { render, fireEvent, waitFor } from 'react-native-testing-library';
import Input from '../../components/Input';

jest.mock('@unform/core', () => ({
  useField() {
    return {
      fieldName: 'email',
      defaultValue: '',
      error: '',
      registerField: jest.fn(),
    };
  },
  fieldName: '',
}));

describe('Input Component', () => {
  it('should be able to render an Input', () => {
    const { getByPlaceholder } = render(
      <Input icon="archive" name="email" placeholder="E-mail" />,
    );

    expect(getByPlaceholder('E-mail')).toBeTruthy();
  });

  it('should render highlight on input focus', async () => {
    const { getByPlaceholder, getByTestId } = render(
      <Input icon="archive" name="email" placeholder="E-mail" />,
    );

    const inputElement = getByPlaceholder('E-mail');
    const containerElement = getByTestId('input-container');
    const iconElement = getByTestId('input-icon');

    fireEvent(inputElement, 'focus');

    await waitFor(() => {
      expect(containerElement).toHaveStyle({ borderColor: '#ff9000' });
      expect(iconElement).toHaveStyle({ color: '#ff9000' });
    });

    fireEvent(inputElement, 'blur');

    await waitFor(() => {
      expect(containerElement).not.toHaveStyle({
        borderColor: '#ff9000',
      });
      expect(iconElement).not.toHaveStyle({ color: '#ff9000' });
    });
  });

  it('should keep input border highlight when input filled', async () => {
    const { getByPlaceholder, getByTestId } = render(
      <Input icon="archive" name="email" placeholder="E-mail" />,
    );

    const inputElement = getByPlaceholder('E-mail');
    const iconElement = getByTestId('input-icon');

    fireEvent(inputElement, 'onChangeText', 'johndoe@exemple.com.br');

    fireEvent(inputElement, 'blur');

    await waitFor(() => {
      expect(iconElement).toHaveStyle({ color: '#ff9000' });
    });
  });
});
