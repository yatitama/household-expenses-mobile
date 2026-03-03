import './global.css';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import { syncStorage } from './src/services/syncStorage';
import { runMigrations } from './src/services/storage';
import { initializeDefaultData } from './src/services/initialData';
import { settleOverdueTransactions } from './src/utils/billingUtils';
import { logger } from './src/services/logger';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { TransactionFilterProvider } from './src/contexts/TransactionFilterContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { COLORS_SEMANTIC, COLORS_GRAY } from './src/constants/colors';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await syncStorage.initialize();
        runMigrations();
        initializeDefaultData();
        settleOverdueTransactions();
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error('初期化に失敗しました');
        logger.error('App initialization failed', errorInstance);
        setInitError(errorInstance);
      } finally {
        setIsReady(true);
      }
    };
    void init();
  }, []);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS_SEMANTIC.white,
        }}
      >
        <ActivityIndicator size="large" color={COLORS_GRAY[700]} />
      </View>
    );
  }

  if (initError) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS_SEMANTIC.white,
          paddingHorizontal: 16,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: COLORS_GRAY[900],
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          初期化エラー
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: COLORS_GRAY[500],
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          {initError.message}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setInitError(null);
            setIsReady(false);
            const init = async () => {
              try {
                await syncStorage.initialize();
                runMigrations();
                initializeDefaultData();
                settleOverdueTransactions();
              } catch (error) {
                const errorInstance = error instanceof Error ? error : new Error('初期化に失敗しました');
                logger.error('App initialization retry failed', errorInstance);
                setInitError(errorInstance);
              } finally {
                setIsReady(true);
              }
            };
            void init();
          }}
          style={{
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: COLORS_SEMANTIC.accent500,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: COLORS_SEMANTIC.white, fontSize: 16, fontWeight: '600' }}>
            再試行
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <TransactionFilterProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
            <Toast />
          </TransactionFilterProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
