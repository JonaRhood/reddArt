import { PayloadAction } from '@reduxjs/toolkit';
import { createAppSlice } from '@/lib/createAppSlice';

interface TokenState {
  value: string | null;
}

const initialState: TokenState = {
  value: null,
};

export const tokenSlice = createAppSlice({
  name: 'token',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.value = action.payload;
    },
  },
  selectors: {
    selectToken: (token) => token.value
  }
});

export const { setToken } = tokenSlice.actions;

export const { selectToken } = tokenSlice.selectors;
