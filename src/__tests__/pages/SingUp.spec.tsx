import React from 'react';
import { render, fireEvent, waitFor } from 'react-native-testing-library';
import MockAdapter from 'axios-mock-adapter';

import { Alert } from 'react-native';
import SignUp from '../../pages/SignUp';
import api from '../../services/api';

const apiMock = new MockAdapter(api);

const apiResponse = {
  id: 'user-123',
  name: 'John Doe',
  email: 'johndoe@exemple.com.br',
};

const mockedUseNavigation = jest.fn();
const mockedUseNavigationGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockedUseNavigation,
    goBack: mockedUseNavigationGoBack,
  }),
}));

describe('SingUp Page', () => {
  beforeEach(() => {
    mockedUseNavigation.mockClear();
    mockedUseNavigationGoBack.mockClear();
  });

  it('should be able to signUp', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    apiMock.onPost('/users').reply(200, apiResponse);
    const { getByPlaceholder, getByText } = render(<SignUp />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');
    const buttonElement = getByText('Cadastrar');

    fireEvent.changeText(nameField, 'John Doe');
    fireEvent.changeText(emailField, 'johndoe@exemple.com');
    fireEvent.changeText(passwordField, '12345678');

    fireEvent.press(buttonElement);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Cadastro realizado com sucesso!',
        'Você já pode fazer seu logon no Go Barber.',
      );
      expect(mockedUseNavigationGoBack).toHaveBeenCalled();
    });
  });

  it('should not be able to signUp with invalid creadentials', async () => {
    apiMock.onPost('/users').reply(200, apiResponse);
    const { getByPlaceholder } = render(<SignUp />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');

    fireEvent.changeText(nameField, 'John Doe');
    fireEvent.changeText(emailField, 'not-valid-email');
    fireEvent.changeText(passwordField, '12345678');

    fireEvent(nameField, 'onSubmitEditing');
    fireEvent(emailField, 'onSubmitEditing');
    fireEvent(passwordField, 'onSubmitEditing');

    await waitFor(() => {
      expect(mockedUseNavigation).not.toHaveBeenCalled();
    });
  });

  it('should display an error if singUp fails', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    apiMock.onPost('/users').reply(400, apiResponse);
    const { getByPlaceholder, getByText } = render(<SignUp />);

    const nameField = getByPlaceholder('Nome');
    const emailField = getByPlaceholder('E-mail');
    const passwordField = getByPlaceholder('Senha');
    const buttonElement = getByText('Cadastrar');

    fireEvent.changeText(nameField, 'John Doe');
    fireEvent.changeText(emailField, 'johndoe@exemple.com');
    fireEvent.changeText(passwordField, '12345678');

    fireEvent.press(buttonElement);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Erro no cadastro',
        'Ocorreu um erro ao realizar cadastro, cheque se as informações não validas.',
      );
    });
  });

  it('should be able to navigate tonavigate to logon', async () => {
    const { getByTestId } = render(<SignUp />);

    const backToLogonField = getByTestId('navigate-logon');

    fireEvent.press(backToLogonField);

    await waitFor(() => {
      expect(mockedUseNavigationGoBack).toHaveBeenCalled();
    });
  });
});
