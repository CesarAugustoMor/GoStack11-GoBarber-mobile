import { renderHook, act } from '@testing-library/react-hooks';
import MockAdapter from 'axios-mock-adapter';
import AsyncStorage from '@react-native-community/async-storage';

import { useAuth, AuthProvider } from '../../hooks/auth';
import api from '../../services/api';

const apiMock = new MockAdapter(api);

describe('Auth hook', () => {
  it('should be able to sign in', async () => {
    const apiResponse = {
      user: {
        id: 'user-123',
        name: 'John Doe',
        email: 'johndoe@exemple.com.br',
      },
      token: 'token-123',
    };
    apiMock.onPost('sessions').reply(200, apiResponse);

    const multiSetSpy = jest.spyOn(AsyncStorage, 'multiSet');

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.signIn({
        email: 'johndoe@exemple.com.br',
        password: '12345678',
      });
    });

    await waitForNextUpdate();

    expect(multiSetSpy).toHaveBeenCalledWith([
      ['@GoBarber:token', apiResponse.token],
      ['@GoBarber:user', JSON.stringify(apiResponse.user)],
    ]);
    expect(result.current.user.email).toEqual('johndoe@exemple.com.br');
  });

  it('should restore saved data from storage when auth inits', async () => {
    AsyncStorage.multiSet([
      ['@GoBarber:token', 'token-123'],
      [
        '@GoBarber:user',
        JSON.stringify({
          id: 'user-123',
          name: 'John Doe',
          email: 'johndoe@exemple.com.br',
        }),
      ],
    ]);

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitForNextUpdate();

    expect(result.current.user.email).toEqual('johndoe@exemple.com.br');
  });

  it('should to sing out', async () => {
    const removeItemSpy = jest.spyOn(AsyncStorage, 'multiRemove');

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.signOut();
    });

    await waitForNextUpdate();

    expect(removeItemSpy).toHaveBeenCalledTimes(1);
    expect(result.current.user).toBeUndefined();
  });

  it('should be able to update user data', async () => {
    const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');

    const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    const user = {
      id: 'user-123',
      name: 'John Doe',
      email: 'johndoe@exemple.com.br',
      avatar_url: 'image-test.jpg',
    };

    act(() => {
      result.current.updateUser(user);
    });

    await waitForNextUpdate();

    expect(setItemSpy).toHaveBeenCalledWith(
      '@GoBarber:user',
      JSON.stringify(user),
    );
    expect(result.current.user).toEqual(user);
  });
});
