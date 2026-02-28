export type Member = {
  id: string;
  name: string;
  color?: string; // hex color
};

export type Category = {
  id: string;
  name: string;
  type: 'expense' | 'income';
  color?: string; // hex color
  icon?: string; // emoji or icon name
};

export type Account = {
  id: string;
  name: string;
  ownerId: string; // Member.id
  color?: string; // hex color
};

export type Card = {
  id: string;
  name: string;
  ownerId: string; // Member.id
  billingAccountId: string; // Account.id
  color?: string; // hex color
};

export type Transaction = {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  categoryId: string; // Category.id
  paymentMethodType: 'cash' | 'card' | 'account';
  paymentMethodId?: string; // Card.id or Account.id
  date: string; // ISO date
  memo?: string;
};

export type AppState = {
  members: Member[];
  categories: Category[];
  accounts: Account[];
  cards: Card[];
  transactions: Transaction[];
};

export type AppAction =
  | { type: 'ADD_MEMBER'; payload: Member }
  | { type: 'UPDATE_MEMBER'; payload: Member }
  | { type: 'DELETE_MEMBER'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'UPDATE_CARD'; payload: Card }
  | { type: 'DELETE_CARD'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState };
