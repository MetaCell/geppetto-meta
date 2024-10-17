import type { Meta, StoryObj } from '@storybook/react';

import Graph from '@metacell/geppetto-meta-ui/graph-visualization/Graph';

const meta = {
  title: 'Example/Graph',
  component: Graph,
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div style={{ height: '700px', width: '900px' }}>
        <Story />
      </div>
    )],
} satisfies Meta<typeof Graph>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    data: {
      nodes: [
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ],
      links: [
        { source: 1, target: 2 },
        { source: 2, target: 3 },
        { source: 3, target: 1 },
      ],
    },
    nodeLabel: node => node.name,
    linkLabel: link => link.name,
    nodeRelSize: 5,
  },
};

export const Secondary: Story = {
  args: {
    nodeLabel: node => node.name,
    linkLabel: link => link.name,
    data: {
      nodes: [
        { id: 1 },
        { id: 2 },
      ],
      links: [
        { source: 1, target: 2 },
      ],
    },
    nodeRelSize: 10,
  },
};
