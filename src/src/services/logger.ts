/**
 * ログサービス
 * console.log/warn/error の直接使用を禁止し、このサービスを通じてログを出力
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type Logger = {
  debug: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => void;
};

const logMessage = (level: LogLevel, message: string, context?: Record<string, unknown>) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...(context && { context }),
  };

  // 開発環境でのみコンソール出力
  if (__DEV__) {
    const logFn = {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    }[level];

    logFn(`[${logEntry.level}] ${message}`, context || '');
  }

  // 本番環境では Sentry や他の監視サービスに送信可能
  // TODO: Sentry等への統合
};

/**
 * グローバルロガーインスタンス
 * 全体で共通のロガーを使用
 */
export const logger: Logger = {
  debug: (message, context) => logMessage('debug', message, context),
  info: (message, context) => logMessage('info', message, context),
  warn: (message, context) => logMessage('warn', message, context),
  error: (message, error, context) => {
    const errorContext = {
      ...context,
      ...(error instanceof Error && {
        errorMessage: error.message,
        errorStack: error.stack,
      }),
    };
    logMessage('error', message, errorContext);
  },
};
