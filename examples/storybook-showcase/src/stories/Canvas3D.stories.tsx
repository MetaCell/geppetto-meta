import type { Meta } from '@storybook/react';
import { Title, Subtitle, Description, Primary, Controls } from '@storybook/blocks';

import Canvas from '@metacell/geppetto-meta-ui/3d-canvas/Canvas';

const meta = {
  title: 'Data Viewers/3D Canvas',
  component: Canvas,
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
    docs: {
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Controls />
        </>
      ),
    },
  },
  decorators: [
    Story => (
      <div style={{ height: '700px', width: '900px' }}>
        <Story />
      </div>
    )],
} satisfies Meta<typeof Canvas>;

export default meta;
// type Story = StoryObj<typeof meta>;

export { SimpleInstance } from './3d-canvas-stories/simpleInstances';
export { MultipleInstances } from './3d-canvas-stories/multipleInstance';
export { AuditoryCortexExample } from './3d-canvas-stories/auditoryCortexExample';
export { AuditoryCortexExampleWithTooltip } from './3d-canvas-stories/auditoryCortexExample2';
