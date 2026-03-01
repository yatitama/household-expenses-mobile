import { useRef } from 'react';
import { PanResponder, Animated } from 'react-native';

interface UseTransactionSwipeProps {
  onSwipeLeft: () => void; // Edit
  onSwipeRight: () => void; // Delete
}

export const useTransactionSwipe = ({
  onSwipeLeft,
  onSwipeRight,
}: UseTransactionSwipeProps) => {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) =>
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10,
      onPanResponderMove: (_evt, gestureState) => {
        // Limit drag distance to prevent over-dragging
        if (Math.abs(gestureState.dx) < 80) {
          pan.x.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_evt, gestureState) => {
        // Left swipe (edit)
        if (gestureState.dx < -50) {
          onSwipeLeft();
        }
        // Right swipe (delete)
        else if (gestureState.dx > 50) {
          onSwipeRight();
        }
        // Reset position
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    }),
  ).current;

  return {
    panHandlers: panResponder.panHandlers,
    pan,
  };
};
