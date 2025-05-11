export type TabItem = {
  name: string;

  /** tab's route path */
  path: string;

  /** can be closed ? */
  closable: boolean;
};

export interface TabState {
  /** tabsView list */
  tabs: TabItem[];

  /**current tabView id */
  activeTabId: TabItem['path'];
}
