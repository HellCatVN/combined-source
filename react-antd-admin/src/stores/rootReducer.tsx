import { config } from '@configs';
import { combineReducers } from '@reduxjs/toolkit';

import globalReducer from './global.store';
import tabsViewReducer from './tabs-view.store';
import authReducer from './user.store';

const reducers: any = {
  auth: authReducer,
  global: globalReducer,
};

if (config.tabViews) {
  reducers.tabsView = tabsViewReducer;
}

const rootReducer = combineReducers(reducers);

export default rootReducer;
