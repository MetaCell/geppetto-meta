import type { Meta, StoryObj } from '@storybook/react';

import DicomViewer from '@metacell/geppetto-meta-ui/dicom-viewer/DicomViewer';
import { default as PreconfiguredDicomViewer } from '@metacell/geppetto-meta-ui/dicom-viewer/preconf/DicomViewer';

const meta = {
  title: 'Data Viewers/Dicom Viewer',
  component: DicomViewer,
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div style={{ height: '1000px', width: '900px' }}>
        <Story />
      </div>
    )],
  // render: (args: typeof DicomViewer.propTypes) => <DicomViewer {...args} />,
} satisfies Meta<typeof DicomViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const BaseViewer: Story = {
  name: 'Base Dicom Viewer',
  args: {
    data: 'nifti/EX_SITU_2009_UCSD_T1_WEIGHTED.nii.gz',
    id: 'DICOM_CONTAINER',
  },
};

export const Preconfigured: Story = {
  name: 'Preconfigured DicomViewer (using \'prefonf/DicomViewer\')',
  args: {
    data: 'nifti/EX_SITU_2009_UCSD_T1_WEIGHTED.nii.gz',
    id: 'PRECONF_DICOM_CONTAINER',
  },
  render: args => <PreconfiguredDicomViewer {...args} />,
};
