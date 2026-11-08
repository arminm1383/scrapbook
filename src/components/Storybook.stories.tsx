import type { Meta, StoryObj } from '@storybook/react-vite';
import { Storybook } from './Storybook';

const meta = {
  title: 'Scrapbook/Storybook',
  component: Storybook,
  decorators: [(Story) => <main className="home"><Story /></main>],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Storybook>;

export default meta;
type Story = StoryObj<typeof meta>;
export const FrontCover: Story = {};
export const OpenSpread: Story = { args: { initialSpread: 1 } };
export const BackCover: Story = { args: { initialSpread: 6 } };
