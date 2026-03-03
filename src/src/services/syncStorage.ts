import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

/**
 * localStorage と同じ同期 API を持つストレージアダプター。
 * 起動時に initialize() を一度呼ぶことで、以降は同期的な読み書きが可能。
 * 書き込みはキューで順序保証され、完了まで待機する（fire-and-forget 時代は廃止）。
 */
class SyncStorage {
  private cache = new Map<string, string>();
  private writeQueue: Promise<void> = Promise.resolve();

  async initialize(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      if (keys.length > 0) {
        // AsyncStorage v2 (Expo SDK 55) では multiGet がない場合がある
        const entries = await Promise.all(
          (keys as string[]).map(async (k) => [k, await AsyncStorage.getItem(k)] as [string, string | null]),
        );
        for (const [key, value] of entries) {
          if (value !== null) {
            this.cache.set(key, value);
          }
        }
      }
    } catch (e) {
      logger.warn('SyncStorage.initialize failed', { error: e });
      throw e; // 初期化失敗時は呼び出し元で catch できるようにする
    }
  }

  getItem(key: string): string | null {
    return this.cache.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    // 書き込みキューで順序を保証
    this.writeQueue = this.writeQueue.then(async () => {
      try {
        await AsyncStorage.setItem(key, value);
        this.cache.set(key, value); // 永続化完了後にキャッシュ更新
      } catch (e) {
        logger.warn('SyncStorage.setItem failed', { error: e, key });
        throw e; // 呼び出し元で catch できるようにする
      }
    });
  }

  removeItem(key: string): void {
    // 書き込みキューで順序を保証
    this.writeQueue = this.writeQueue.then(async () => {
      try {
        await AsyncStorage.removeItem(key);
        this.cache.delete(key); // 永続化完了後にキャッシュ削除
      } catch (e) {
        logger.warn('SyncStorage.removeItem failed', { error: e, key });
        throw e;
      }
    });
  }

  clear(): void {
    // 書き込みキューで順序を保証
    this.writeQueue = this.writeQueue.then(async () => {
      try {
        await AsyncStorage.clear();
        this.cache.clear(); // 永続化完了後にキャッシュクリア
      } catch (e) {
        logger.warn('SyncStorage.clear failed', { error: e });
        throw e;
      }
    });
  }

  // キューの完了を待機（テストやシャットダウン時に使用）
  async waitForPendingWrites(): Promise<void> {
    return this.writeQueue;
  }
}

export const syncStorage = new SyncStorage();
