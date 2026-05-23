import * as React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ScreeningScreen from './src/screens/ScreeningScreen';
import MyReservationsScreen from './src/screens/MyReservationsScreen';
import AdminScreen from './src/screens/AdminScreen';
import SuccessScreen from './src/screens/SuccessScreen';
import { AuthProvider } from './src/context/AuthContext';
import { theme } from './src/theme/theme';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.bgSecondary,
        },
        headerTintColor: theme.colors.accentGold,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: theme.colors.bgPrimary,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Rejestracja', headerBackTitleVisible: false }}
      />
      <Stack.Screen
        name="Screening"
        component={ScreeningScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyReservations"
        component={MyReservationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Success"
        component={SuccessScreen}
        options={{ headerShown: false, animation: 'fade' }}
      />
      <Stack.Screen name="Admin" component={AdminScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.bgPrimary,
  },
};

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <AuthProvider>
        <StatusBar style="light" />
        <NavigationContainer theme={MyTheme}>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
