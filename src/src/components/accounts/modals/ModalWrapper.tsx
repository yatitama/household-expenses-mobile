import React, { useRef, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  /** モーダルの表示状態（デフォルト: true） */
  visible?: boolean;
}

export const ModalWrapper = ({
  onClose,
  title,
  children,
  isForm = false,
  footer,
  headerAction,
  visible = true,
}: ModalWrapperProps) => {
  const insets = useSafeAreaInsets();
  // シート入場時は画面外（下）から開始し、スプリングで引き上げる
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  // ScrollView のスクロール位置を追跡（先頭でのみスワイプ閉じを有効にする）
  const scrollY = useRef(0);
  // キーボード表示中はフッター下余白を詰める
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // iOS は will 系（アニメーション前に高さを取得）、Android は did 系（adjustResize でウィンドウ縮小後）
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

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

  // ドラッグハンドル・ヘッダー・フッターの固定高さを除いた最大スクロール領域
  const DRAG_H = isForm ? 30 : 0;
  const HEADER_H = 52;
  const FOOTER_H = footer ? 72 : 0;
  // キーボード表示時は利用可能高さを縮小（iOS: KAV の padding 分、Android: adjustResize でウィンドウ縮小分）
  const availableHeight = SCREEN_HEIGHT - keyboardHeight;
  const scrollMaxHeight = availableHeight * 0.9 - DRAG_H - HEADER_H - FOOTER_H - 8;

  // フッターの下余白: キーボード表示中はセーフエリア不要（キーボードがカバーするため）
  const footerPaddingBottom = keyboardHeight > 0 ? 8 : Math.max(insets.bottom, 8) + 12;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={close}
    >
      <View className="flex-1 justify-end">
        {/* 暗転バックドロップ: 絶対配置でシートの背面をカバー */}
        <TouchableWithoutFeedback onPress={isForm ? close : undefined}>
          <View
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            className="bg-black/50"
          />
        </TouchableWithoutFeedback>

        {/* シート本体: panHandlers をシート全体に適用 */}
        <Animated.View
          style={{ transform: [{ translateY }] }}
          className={`bg-white dark:bg-primary-800 w-full ${isForm ? 'rounded-t-xl' : ''}`}
          {...(isForm ? panResponder.panHandlers : {})}
          // タッチをここで消費してバックドロップへのタップ伝播を防ぐ
          onStartShouldSetResponder={() => true}
        >
          {/* ドラッグハンドル */}
          {isForm && (
            <View className="items-center py-sm">
              <View className="w-10 h-1 bg-primary-300 dark:bg-primary-600 rounded-full" />
            </View>
          )}

          {/* ヘッダー */}
          <View className="flex-row items-center justify-between p-lg border-b border-primary-200 dark:border-primary-700">
            <View className="flex-row items-center gap-md flex-1">
              <Text className="text-lg font-bold text-primary-900 dark:text-primary-50">{title}</Text>
              {headerAction}
            </View>
            {/* 44pt minimum touch target (iOS HIG) */}
            <TouchableOpacity
              onPress={close}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* KeyboardAvoidingView: iOS ではシートを動かさずに内部余白でフッターを押し上げる */}
          {/* Android は adjustResize でウィンドウ自体が縮小されるので無効 */}
          <KeyboardAvoidingView behavior="padding" enabled={Platform.OS === 'ios'}>
            {/* コンテンツ: maxHeight で ScrollView を明示的に制限してスクロールを保証 */}
            <ScrollView
              style={{ maxHeight: scrollMaxHeight }}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 8 }}
              keyboardShouldPersistTaps="handled"
              onScroll={(e) => { scrollY.current = e.nativeEvent.contentOffset.y; }}
              scrollEventThrottle={16}
            >
              {children}
            </ScrollView>

            {/* フッター: 常にスクロール領域の外に固定表示 */}
            {footer && (
              <View
                className="px-lg pt-lg border-t border-primary-200 dark:border-primary-700"
                style={{ paddingBottom: footerPaddingBottom }}
              >
                {footer}
              </View>
            )}
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};
