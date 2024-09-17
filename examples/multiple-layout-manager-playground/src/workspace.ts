import type { LayoutManager } from "@metacell/geppetto-meta-client/common/layout/LayoutManager";
import type { configureStore } from "@reduxjs/toolkit";
import getLayoutManagerAndStore from "./layout-manager/layoutManagerFactory";
// import { SynchronizerOrchestrator } from "./synchronizer";

export class Workspace {
  id: string;
  name: string;
  store: ReturnType<typeof configureStore>;
  layoutManager: LayoutManager;

//   syncOrchestrator: SynchronizerOrchestrator;
  updateContext: (workspace: Workspace) => void;

  constructor(id: string, name: string, updateContext: (workspace: Workspace) => void) {
    this.id = id;
    this.name = name;
    const { layoutManager, store } = getLayoutManagerAndStore(id);
    this.layoutManager = layoutManager;
    // this.syncOrchestrator = SynchronizerOrchestrator.create();

    this.store = store;
    this.updateContext = updateContext;
  }
}
