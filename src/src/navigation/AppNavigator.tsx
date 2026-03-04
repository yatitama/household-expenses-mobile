import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import type {
  RootTabParamList,
  SettingsStackParamList,
  TransactionsStackParamList,
  AddTransactionStackParamList,
} from './types/navigation';

// Import new screens (we'll create these)
import { MemberDetailScreen } from '../screens/settings/MemberDetailScreen';
import { CategoryDetailScreen } from '../screens/settings/CategoryDetailScreen';
import { AccountDetailScreen } from '../screens/settings/AccountDetailScreen';
import { PaymentMethodDetailScreen } from '../screens/settings/PaymentMethodDetailScreen';
import { RecurringPaymentDetailScreen } from '../screens/settings/RecurringPaymentDetailScreen';
import { SavingsGoalDetailScreen } from '../screens/settings/SavingsGoalDetailScreen';
import { FilterScreen } from '../screens/transactions/FilterScreen';
import { TransactionDetailsScreen } from '../screens/transactions/TransactionDetailsScreen';
import { QuickAddTemplateDetailScreen } from '../screens/addTransaction/QuickAddTemplateDetailScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const TransactionsStack = createNativeStackNavigator<TransactionsStackParamList>();
const AddTransactionStack = createNativeStackNavigator<AddTransactionStackParamList>();

// Settings Stack Navigator
const SettingsTabNavigator = () => (
  <SettingsStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <SettingsStack.Screen
      name="SettingsScreen"
      component={SettingsScreen}
      options={{ headerShown: false }}
    />
    <SettingsStack.Screen
      name="MemberDetail"
      component={MemberDetailScreen}
      options={{
        presentation: 'modal',
        headerShown: true,
        title: 'メンバー',
      }}
    />
    <SettingsStack.Screen
      name="CategoryDetail"
      component={CategoryDetailScreen}
      options={{
        presentation: 'modal',
        headerShown: true,
        title: 'カテゴリ',
      }}
    />
    <SettingsStack.Screen
      name="AccountDetail"
      component={AccountDetailScreen}
      options={{
        presentation: 'modal',
        headerShown: true,
        title: '口座',
      }}
    />
    <SettingsStack.Screen
      name="PaymentMethodDetail"
      component={PaymentMethodDetailScreen}
      options={{
        presentation: 'modal',
        headerShown: true,
        title: 'カード',
      }}
    />
    <SettingsStack.Screen
      name="RecurringPaymentDetail"
      component={RecurringPaymentDetailScreen}
      options={{
        presentation: 'modal',
        headerShown: true,
        title: '定期取引',
      }}
    />
    <SettingsStack.Screen
      name="SavingsGoalDetail"
      component={SavingsGoalDetailScreen}
      options={{
        presentation: 'modal',
        headerShown: true,
        title: '貯金目標',
      }}
    />
  </SettingsStack.Navigator>
);

// Transactions Stack Navigator
const TransactionsTabNavigator = () => (
  <TransactionsStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <TransactionsStack.Screen
      name="TransactionsScreen"
      component={TransactionsScreen}
      options={{ headerShown: false }}
    />
    <TransactionsStack.Screen
      name="FilterScreen"
      component={FilterScreen}
      options={{
        presentation: 'modal',
        headerShown: true,
        title: 'フィルター',
      }}
    />
    <TransactionsStack.Screen
      name="TransactionDetailsScreen"
      component={TransactionDetailsScreen}
      options={{
        presentation: 'modal',
        headerShown: true,
        title: '取引詳細',
      }}
    />
  </TransactionsStack.Navigator>
);

// AddTransaction Stack Navigator
const AddTransactionTabNavigator = () => (
  <AddTransactionStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <AddTransactionStack.Screen
      name="AddTransactionScreen"
      component={AddTransactionScreen}
      options={{ headerShown: false }}
    />
    <AddTransactionStack.Screen
      name="QuickAddTemplateDetail"
      component={QuickAddTemplateDetailScreen}
      options={{
        presentation: 'modal',
        headerShown: true,
        title: 'クイック入力',
      }}
    />
  </AddTransactionStack.Navigator>
);

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
            <AddTransactionTabNavigator />
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
            <TransactionsTabNavigator />
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
            <SettingsTabNavigator />
          </ErrorBoundary>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};
