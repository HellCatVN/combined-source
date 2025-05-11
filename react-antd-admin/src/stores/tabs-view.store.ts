import type { TabItem, TabState } from '@interfaces';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

const initialState: TabState = {
  activeTabId: window.location.pathname,
  tabs: [],
};

const tabsViewSlice = createSlice({
  name: 'tabsView',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<string>) {
      state.activeTabId = action.payload;
    },
    addTab(state, action: PayloadAction<TabItem>) {
      if (!state.tabs.find((tab: TabItem) => tab.path === action.payload.path)) {
        state.tabs.push(action.payload);
      }

      state.activeTabId = action.payload.path;
    },
    removeTab(state, action: PayloadAction<string>) {
      const targetKey = action.payload;
      // dashboard cloud't be closed

      if (targetKey === state.tabs[0].path) {
        return;
      }

      const activeTabId = state.activeTabId;
      let lastIndex = 0;

      state.tabs.forEach((tab: TabItem, i: number) => {
        if (tab.path === targetKey) {
          state.tabs.splice(i, 1);
          lastIndex = i - 1;
        }
      });
      const tabList = state.tabs.filter((tab: TabItem) => tab.path !== targetKey);

      if (tabList.length && activeTabId === targetKey) {
        if (lastIndex >= 0) {
          state.activeTabId = tabList[lastIndex].path;
        } else {
          state.activeTabId = tabList[0].path;
        }
      }
    },
    removeAllTab(state) {
      state.activeTabId = window.location.pathname;
      state.tabs = [];
    },
    removeOtherTab(state) {
      const activeTab = state.tabs.find((tab: TabItem) => tab.path === state.activeTabId);
      const activeIsDashboard = activeTab!.path === state.tabs[0].path;

      state.tabs = activeIsDashboard ? [state.tabs[0]] : [state.tabs[0], activeTab!];
    },
  },
});

export const { setActiveTab, addTab, removeTab, removeAllTab, removeOtherTab } =
  tabsViewSlice.actions;

export default tabsViewSlice.reducer;
