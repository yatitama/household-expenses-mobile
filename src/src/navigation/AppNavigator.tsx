import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TrendingUp, List, Settings as SettingsIcon, Plus, Wallet } from 'lucide-react-native';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountsScreen } from '../screens/AccountsScreen';
import { MoneyScreen } from '../screens/MoneyScreen';
import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useTheme } from '../contexts/ThemeContext';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';
import { COLORS_GRAY, UI_COLORS } from '../constants/colors';

export type RootTabParamList = {
  Accounts: undefined;
  Money: undefined;
  AddTransaction: undefined;
  Transactions: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const AppNavigator = () => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const TAB_BAR_BG_COLOR = isDark ? COLORS_GRAY[800] : COLORS_GRAY[50];
  const TAB_BAR_BORDER_COLOR = isDark ? COLORS_GRAY[700] : COLORS_GRAY[200];

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: TAB_BAR_BG_COLOR,
          borderTopWidth: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          elevation: 0,
        },
        tabBarActiveTintColor: UI_COLORS.iconActive,
        tabBarInactiveTintColor: UI_COLORS.iconInactive,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tab.Screen
        name="Accounts"
        options={{
          title: '収支',
          tabBarIcon: ({ focused }) => (
            <TrendingUp size={22} color={focused ? UI_COLORS.iconActive : UI_COLORS.iconInactive} />
          ),
        }}
      >
        {() => (
          <ErrorBoundary>
            <AccountsScreen />
          </ErrorBoundary>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Money"
        options={{
          title: 'お金',
          tabBarIcon: ({ focused }) => (
            <Wallet size={22} color={focused ? UI_COLORS.iconActive : UI_COLORS.iconInactive} />
          ),
        }}
      >
        {() => (
          <ErrorBoundary>
            <MoneyScreen />
          </ErrorBoundary>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="AddTransaction"
        options={{
          title: '',
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <TouchableOpacity
              onPress={props.onPress as () => void}
              accessibilityRole="button"
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: -24,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: UI_COLORS.iconActive,
                  borderWidth: 3,
                  borderColor: TAB_BAR_BORDER_COLOR,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: COLORS_GRAY[900],
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Plus size={24} color={UI_COLORS.white} />
              </View>
            </TouchableOpacity>
          ),
        }}
      >
        {() => (
          <ErrorBoundary>
            <AddTransactionScreen />
          </ErrorBoundary>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Transactions"
        options={{
          title: '履歴',
          tabBarIcon: ({ focused }) => (
            <List size={22} color={focused ? UI_COLORS.iconActive : UI_COLORS.iconInactive} />
          ),
        }}
      >
        {() => (
          <ErrorBoundary>
            <TransactionsScreen />
          </ErrorBoundary>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Settings"
        options={{
          title: '設定',
          tabBarIcon: ({ focused }) => (
            <SettingsIcon size={22} color={focused ? UI_COLORS.iconActive : UI_COLORS.iconInactive} />
          ),
        }}
      >
        {() => (
          <ErrorBoundary>
            <SettingsScreen />
          </ErrorBoundary>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};
