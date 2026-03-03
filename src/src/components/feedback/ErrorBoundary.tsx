import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center p-md bg-primary-50">
          <View className="bg-white rounded-lg p-lg w-full items-center">
            <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center mb-md">
              <AlertTriangle size={32} color="#1f2937" />
            </View>
            <Text className="text-2xl font-bold mb-sm text-primary-900">予期しないエラーです</Text>
            <Text className="text-base text-primary-600 text-center mb-md">
              アプリケーション実行中にエラーが発生しました。
            </Text>
            {this.state.error && (
              <ScrollView className="mb-md p-sm bg-primary-100 rounded-md w-full max-h-24">
                <Text className="text-label font-mono text-primary-900">{this.state.error.message}</Text>
              </ScrollView>
            )}
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}
