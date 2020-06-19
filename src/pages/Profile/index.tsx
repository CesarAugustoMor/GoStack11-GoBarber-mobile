import { useNavigation } from '@react-navigation/native';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/mobile';
import React, { useCallback, useRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import * as Yup from 'yup';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';
import getValidationErrors from '../../utils/getValidationErrors';
import {
  BackButton,
  BackButtonUserAvatarContainer,
  Container,
  Title,
  UserAvatar,
  UserAvatarButton,
} from './styles';

interface ProfileFormData {
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const formRef = useRef<FormHandles>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const { goBack } = useNavigation();

  const handleUpdateProfile = useCallback(
    async (data: ProfileFormData) => {
      if (!data.email) {
        Object.assign(data, { email: user.email });
      }
      if (!data.name) {
        Object.assign(data, { name: user.name });
      }

      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),
          email: Yup.string()
            .required('E-mail obrigatório')
            .email('Digite um e-mail válido'),
          old_password: Yup.string(),
          password: Yup.string().when('old_password', {
            is: val => !!val.length,
            then: Yup.string()
              .required('Nova senha obrigatório')
              .min(6, 'Mínimo de 6 dígitos'),
            otherwise: Yup.string(),
          }),
          confirmPassword: Yup.string()
            .when('old_password', {
              is: val => !!val.length,
              then: Yup.string()
                .required('Confirmação de senha obrigatório')
                .min(6, 'Mínimo de 6 dígitos'),
              otherwise: Yup.string(),
            })
            .oneOf(
              [Yup.ref('password'), null],
              'As senhas precisam ser iguais',
            ),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const {
          name,
          email,
          old_password,
          password,
          password_confirmation,
        } = data;

        const formData = {
          name,
          email,
          ...(old_password
            ? {
                old_password,
                password,
                password_confirmation,
              }
            : {}),
        };

        const response = await api.put('/profile', formData);

        updateUser(response.data);

        Alert.alert('Perfil atualizado com sucesso');

        goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        Alert.alert(
          'Erro na atualização de perfil',
          'Ocorreu um erro ao fazer a atualização do perfil, tente novamente.',
        );
      }
    },
    [goBack],
  );

  const handleGoBack = useCallback(() => {
    goBack();
  }, [goBack]);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flex: 1 }}
        >
          <Container>
            <BackButtonUserAvatarContainer>
              <BackButton onPress={handleGoBack}>
                <Icon name="chevron-left" size={24} color="#999591" />
              </BackButton>
              <UserAvatarButton onPress={handleUpdateAvatar}>
                <UserAvatar source={{ uri: user.avatar_url }} />
              </UserAvatarButton>
            </BackButtonUserAvatarContainer>
            <View>
              <Title>Meu Perfil</Title>
            </View>

            <Form
              ref={formRef}
              initialData={{ name: user.name, email: user.email }}
              onSubmit={handleUpdateProfile}
            >
              <Input
                autoCapitalize="words"
                name="name"
                icon="user"
                placeholder="Nome"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailInputRef.current?.focus();
                }}
              />
              <Input
                ref={emailInputRef}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                name="email"
                icon="mail"
                placeholder="E-mail"
                returnKeyType="next"
                onSubmitEditing={() => {
                  oldPasswordInputRef.current?.focus();
                }}
              />

              <Input
                ref={oldPasswordInputRef}
                secureTextEntry
                name="old_password"
                icon="lock"
                placeholder="Senha atual"
                returnKeyType="next"
                textContentType="newPassword"
                containerStyle={{ marginTop: 16 }}
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
              />

              <Input
                ref={passwordInputRef}
                secureTextEntry
                name="password_confirmation"
                icon="lock"
                placeholder="Nova Senha"
                returnKeyType="next"
                textContentType="newPassword"
                onSubmitEditing={() => {
                  confirmPasswordInputRef.current?.focus();
                }}
              />

              <Input
                ref={confirmPasswordInputRef}
                secureTextEntry
                name="password"
                icon="lock"
                placeholder="Confirmar Senha"
                returnKeyType="send"
                textContentType="newPassword"
                onSubmitEditing={() => {
                  formRef.current?.submitForm();
                }}
              />

              <Button
                onPress={() => {
                  formRef.current?.submitForm();
                }}
              >
                Confirmar mudanças
              </Button>
            </Form>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Profile;
