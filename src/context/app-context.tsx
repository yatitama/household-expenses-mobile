import React, { createContext, useReducer, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppAction } from '@/types';

const initialState: AppState = {
  members: [],
  categories: [],
  accounts: [],
  cards: [],
  transactions: [],
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_MEMBER':
      return { ...state, members: [...state.members, action.payload] };
    case 'UPDATE_MEMBER':
      return {
        ...state,
        members: state.members.map((m) => (m.id === action.payload.id ? action.payload : m)),
      };
    case 'DELETE_MEMBER':
      return {
        ...state,
        members: state.members.filter((m) => m.id !== action.payload),
      };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
      };
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.payload] };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter((a) => a.id !== action.payload),
      };
    case 'ADD_CARD':
      return { ...state, cards: [...state.cards, action.payload] };
    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };
    case 'DELETE_CARD':
      return {
        ...state,
        cards: state.cards.filter((c) => c.id !== action.payload),
      };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
};

export const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({
  state: initialState,
  dispatch: () => {},
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await AsyncStorage.getItem('appState');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          dispatch({ type: 'LOAD_STATE', payload: parsedState });
        }
      } catch (error) {
        console.error('Failed to load state:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadState();
  }, []);

  // Save state to AsyncStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem('appState', JSON.stringify(state)).catch((error) => {
        console.error('Failed to save state:', error);
      });
    }
  }, [state, isLoaded]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
