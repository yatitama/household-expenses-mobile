import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TransactionType } from '../../types';

// Settings Stack
export type SettingsStackParamList = {
  SettingsScreen: undefined;
  MemberDetail: { memberId?: string };
  CategoryDetail: { categoryId?: string; defaultType?: TransactionType };
  AccountDetail: { accountId?: string };
  PaymentMethodDetail: { paymentMethodId?: string };
  RecurringPaymentDetail: { recurringPaymentId?: string };
  SavingsGoalDetail: { savingsGoalId?: string };
};

// Transactions Stack
export type TransactionsStackParamList = {
  TransactionsScreen: undefined;
  FilterScreen: undefined;
  TransactionDetailsScreen: { transactionId: string };
};

// AddTransaction Stack
export type AddTransactionStackParamList = {
  AddTransactionScreen: undefined;
  QuickAddTemplateDetail: { templateId?: string };
};

// Root Tab Param List
export type RootTabParamList = {
  Accounts: undefined;
  Money: undefined;
  AddTransaction: undefined;
  Transactions: undefined;
  Settings: undefined;
};

// Screen props type helpers
export type SettingsScreenProps = NativeStackScreenProps<SettingsStackParamList, 'SettingsScreen'>;
export type MemberDetailScreenProps = NativeStackScreenProps<SettingsStackParamList, 'MemberDetail'>;
export type CategoryDetailScreenProps = NativeStackScreenProps<SettingsStackParamList, 'CategoryDetail'>;
export type AccountDetailScreenProps = NativeStackScreenProps<SettingsStackParamList, 'AccountDetail'>;
export type PaymentMethodDetailScreenProps = NativeStackScreenProps<SettingsStackParamList, 'PaymentMethodDetail'>;
export type RecurringPaymentDetailScreenProps = NativeStackScreenProps<SettingsStackParamList, 'RecurringPaymentDetail'>;
export type SavingsGoalDetailScreenProps = NativeStackScreenProps<SettingsStackParamList, 'SavingsGoalDetail'>;

export type TransactionsScreenProps = NativeStackScreenProps<TransactionsStackParamList, 'TransactionsScreen'>;
export type FilterScreenProps = NativeStackScreenProps<TransactionsStackParamList, 'FilterScreen'>;
export type TransactionDetailsScreenProps = NativeStackScreenProps<TransactionsStackParamList, 'TransactionDetailsScreen'>;

export type AddTransactionScreenProps = NativeStackScreenProps<AddTransactionStackParamList, 'AddTransactionScreen'>;
export type QuickAddTemplateDetailScreenProps = NativeStackScreenProps<AddTransactionStackParamList, 'QuickAddTemplateDetail'>;
