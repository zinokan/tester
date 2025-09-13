import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import matchReducer from './slices/matchSlice';
import messageReducer from './slices/messageSlice';
import premiumReducer from './slices/premiumSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user'], // Only persist auth and user data
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  match: matchReducer,
  message: messageReducer,
  premium: premiumReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);