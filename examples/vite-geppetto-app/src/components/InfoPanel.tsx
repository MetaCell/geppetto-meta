import { Box, Typography, Divider } from "@mui/material";

/*
 * Placeholder panel rendered in the layout when no specific viewer is active.
 * Shows a short description of the app and how to use the sidebar toggles.
 */
const InfoPanel = () => (
  <Box sx={{ p: 3, height: "100%", overflow: "auto" }}>
    <Typography variant="h6" gutterBottom>
      Geppetto Example App
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      This example demonstrates the <strong>@metacell/geppetto</strong> package — the unified
      replacement for geppetto-meta-ui, geppetto-meta-core, and geppetto-meta-client.
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      Use the sidebar toggles to open the <strong>DICOM Viewer</strong> or the{" "}
      <strong>3D Canvas</strong> inside the flexible layout panels.
    </Typography>
    <Typography variant="caption" color="text.disabled">
      Components used: <code>DicomViewerPreconf</code>, <code>Canvas3D</code>,{" "}
      <code>Toolbar3D</code>, <code>LayoutManager</code>
    </Typography>
  </Box>
);

export default InfoPanel;
