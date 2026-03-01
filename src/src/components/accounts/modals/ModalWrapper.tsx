import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface ModalWrapperProps {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** フォーム入力モーダルは isForm=true（角丸あり、外タッチで閉じる、スワイプで閉じる） */
  isForm?: boolean;
  /** フッターに表示するコンテンツ（保存ボタンなど） */
  footer?: React.ReactNode;
  /** タイトル右横のアクションアイコン（削除ボタンなど） */
  headerAction?: React.ReactNode;
}

export const ModalWrapper = ({
  onClose,
  title,
  children,
  isForm = false,
  footer,
  headerAction,
}: ModalWrapperProps) => {
  // シート入場時は画面外（下）から開始し、スプリングで引き上げる
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  // ScrollView のスクロール位置を追跡（先頭でのみスワイプ閉じを有効にする）
  const scrollY = useRef(0);

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 30,
      stiffness: 300,
    }).start();
  }, []);

  /** シートを画面外へ退場させてから onClose を呼ぶ */
  const close = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const panResponder = useRef(
    PanResponder.create({
      // キャプチャフェーズで ScrollView からジェスチャーを奪う
      // ・スクロール先頭 (scrollY === 0) かつ下方向スワイプのみ
      onMoveShouldSetPanResponderCapture: (_, gs) =>
        isForm &&
        scrollY.current <= 0 &&
        gs.dy > 10 &&
        gs.dy > Math.abs(gs.dx),
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) translateY.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 80 || gs.vy > 0.5) {
          close();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={close}
    >
      {/* 暗転バックドロップ: animationType="none" により即時表示・非表示 */}
      <TouchableWithoutFeedback onPress={isForm ? close : undefined}>
        <View className="flex-1 bg-black/50 justify-end">
          {/* シート本体: panHandlers をシート全体に適用 */}
          <Animated.View
            style={{ transform: [{ translateY }] }}
            className={`bg-white dark:bg-slate-800 w-full max-h-[90%] ${isForm ? 'rounded-t-xl' : ''}`}
            {...(isForm ? panResponder.panHandlers : {})}
            // タッチをここで消費してバックドロップへのタップ伝播を防ぐ
            onStartShouldSetResponder={() => true}
          >
            {/* ドラッグハンドル */}
            {isForm && (
              <View className="items-center py-2.5">
                <View className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </View>
            )}

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              {/* ヘッダー */}
              <View className="flex-row items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                <View className="flex-row items-center gap-2 flex-1">
                  <Text className="text-base font-bold text-gray-900 dark:text-gray-100">{title}</Text>
                  {headerAction}
                </View>
                <TouchableOpacity onPress={close} className="p-1.5">
                  <X size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {/* コンテンツ */}
              <ScrollView
                className="p-3"
                keyboardShouldPersistTaps="handled"
                onScroll={(e) => { scrollY.current = e.nativeEvent.contentOffset.y; }}
                scrollEventThrottle={16}
              >
                {children}
              </ScrollView>

              {/* フッター */}
              {footer && (
                <View className="p-3 border-t border-gray-200 dark:border-gray-700">
                  {footer}
                </View>
              )}
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
