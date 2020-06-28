import React from 'react';
import { render, fireEvent, waitFor } from 'react-native-testing-library';

import { Alert } from 'react-native';
import SignIn from '../../pages/SignIn';

const mockedSignIn = jest.fn();

const mockedUseNavigation = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockedUseNavigation,
  }),
}));

jest.mock('../../hooks/auth', () => ({
  useAuth: () => ({
    signIn: mockedSignIn,
  }),
}));

describe('SingIn Page', () => {
  beforeEach(() => {
    mockedUseNavigation.mockClear();
  });
  it('should be able to sign in', async () => {
    const { getByPlaceholder, getByText } = render(<SignIn />);

    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');
    const buttonElement = getByText('Entrar');

    fireEvent.changeText(emailField, 'johndoe@exemple.com');
    fireEvent.changeText(passwordField, '12345678');

    fireEvent.press(buttonElement);

    await waitFor(() => {
      expect(mockedSignIn).toHaveBeenCalledWith({
        email: 'johndoe@exemple.com',
        password: '12345678',
      });
    });
  });

  it('should not be able to sign in with invalid creadentials', async () => {
    const { getByPlaceholder } = render(<SignIn />);

    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');

    fireEvent.changeText(emailField, 'not-valid-email');
    fireEvent.changeText(passwordField, '12345678');

    fireEvent(emailField, 'onSubmitEditing');
    fireEvent(passwordField, 'onSubmitEditing');

    await waitFor(() => {
      expect(mockedUseNavigation).not.toHaveBeenCalled();
    });
  });

  it('should display an error if login fails', async () => {
    mockedSignIn.mockImplementationOnce(() => {
      throw new Error();
    });
    const alertSpy = jest.spyOn(Alert, 'alert');

    const { getByPlaceholder, getByText } = render(<SignIn />);

    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');
    const buttonElement = getByText('Entrar');

    fireEvent.changeText(emailField, 'johndoe@exemple.com');
    fireEvent.changeText(passwordField, '12345678');

    fireEvent.press(buttonElement);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Erro na autenticação',
        'Ocorreu um erro ao fazer login, cheque as credenciais',
      );
    });
  });

  it('should be able to navigate tonavigate to logon', async () => {
    const { getByTestId } = render(<SignIn />);

    const backToLogonField = getByTestId('navigate-SignUp');

    fireEvent.press(backToLogonField);

    await waitFor(() => {
      expect(mockedUseNavigation).toHaveBeenCalledWith('SignUp');
    });
  });
});
