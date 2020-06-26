import { Platform } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: 0 30px ${Platform.OS === 'android' ? 150 : 40}px;
`;

export const Title = styled.Text`
  font-size: 20px;
  color: #f4ede8;
  font-family: 'RobotoSlab-Medium';
  margin: 24px 0;
`;

export const BackButtonUserAvatarContainer = styled.View`
  margin-top: 40px;
  flex-direction: row;
  position: relative;
`;

export const BackButton = styled.TouchableOpacity`
  position: absolute;
  left: 0;
  top: 70px;
`;

export const UserAvatarButton = styled(RectButton)`
  margin: 0 auto;
`;

export const UserAvatar = styled.Image`
  width: 186px;
  height: 186px;
  border-radius: 98px;
  margin-top: 64px;
  align-self: center;
`;
