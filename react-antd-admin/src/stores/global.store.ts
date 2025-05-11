import type { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from '@reduxjs/toolkit';

interface State {
  theme: 'light' | 'dark';
  requests: string[]; // Added requests array
}

const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const userTheme = localStorage.getItem('theme') as State['theme'];

const initialState: State = {
  theme: userTheme || systemTheme,
  requests: [], // Initialize empty requests array
};

const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setGlobalState(state, action: PayloadAction<Partial<State>>) {
      Object.assign(state, action.payload);

      if (action.payload.theme) {
        const body = document.body;

        if (action.payload.theme === 'dark') {
          if (!body.hasAttribute('theme-mode')) {
            body.setAttribute('theme-mode', 'dark');
          }
        } else {
          if (body.hasAttribute('theme-mode')) {
            body.removeAttribute('theme-mode');
          }
        }
      }
    },

    appendRequest(state, action: PayloadAction<string>) {
      state.requests.push(action.payload);
    },

    removeRequest(state, action: PayloadAction<string>) {
      state.requests = state.requests.filter(id => id !== action.payload);
    },
  },
});

export const { setGlobalState, appendRequest, removeRequest } = globalSlice.actions;

export default globalSlice.reducer;
