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

export type RootTabParamList = {
  Accounts: undefined;
  Money: undefined;
  AddTransaction: undefined;
  Transactions: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// iOS Human Interface Guidelines: system blue for interactive elements
const ICON_COLOR_ACTIVE = '#007AFF';
const ICON_COLOR_INACTIVE = '#9ca3af';

export const AppNavigator = () => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const TAB_BAR_BG_COLOR = isDark ? '#1c1c1e' : '#ffffff';
  // iOS-standard hairline separator (0.5pt)
  const TAB_BAR_BORDER_COLOR = isDark ? '#38383a' : '#c6c6c8';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          // iOS standard tab bar height is 49pt
          height: 49 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: TAB_BAR_BG_COLOR,
          // iOS hairline top border (no rounded corners — those are Android/Material)
          borderTopWidth: 0.5,
          borderTopColor: TAB_BAR_BORDER_COLOR,
          elevation: 0,
        },
        tabBarActiveTintColor: ICON_COLOR_ACTIVE,
        tabBarInactiveTintColor: ICON_COLOR_INACTIVE,
        // iOS standard tab label: 10pt
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      }}
    >
      <Tab.Screen
        name="Accounts"
        component={AccountsScreen}
        options={{
          title: '収支',
          tabBarIcon: ({ focused }) => (
            // iOS standard tab bar icon: 25pt
            <TrendingUp size={25} color={focused ? ICON_COLOR_ACTIVE : ICON_COLOR_INACTIVE} />
          ),
        }}
      />
      <Tab.Screen
        name="Money"
        component={MoneyScreen}
        options={{
          title: 'お金',
          tabBarIcon: ({ focused }) => (
            <Wallet size={25} color={focused ? ICON_COLOR_ACTIVE : ICON_COLOR_INACTIVE} />
          ),
        }}
      />
      <Tab.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
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
                marginTop: -20,
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: '#007AFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#007AFF',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.35,
                  shadowRadius: 10,
                  elevation: 8,
                }}
              >
                <Plus size={24} color="#ffffff" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          title: '履歴',
          tabBarIcon: ({ focused }) => (
            <List size={25} color={focused ? ICON_COLOR_ACTIVE : ICON_COLOR_INACTIVE} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: '設定',
          tabBarIcon: ({ focused }) => (
            <SettingsIcon size={25} color={focused ? ICON_COLOR_ACTIVE : ICON_COLOR_INACTIVE} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
