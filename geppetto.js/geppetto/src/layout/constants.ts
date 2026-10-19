/*
 * Shared string constants used across the layout subsystem.
 * Exported so that host apps can dispatch IMPORT_APPLICATION_STATE
 * without hard-coding the string.
 */

/** ID of the border panel that minimized widgets are sent to. */
export const MINIMIZED_PANEL = "border_bottom";

/**
 * Action type dispatched when the full application state is being restored
 * (e.g. from a saved session file).  The layout middleware handles this to
 * rebuild the FlexLayout model from the serialised JSON.
 */
export const IMPORT_APPLICATION_STATE = "IMPORT_APPLICATION_STATE";
