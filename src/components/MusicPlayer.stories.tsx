import type { Meta, StoryObj } from '@storybook/react-vite';
import { MusicPlayer } from './MusicPlayer';

const meta = {
  title: 'Scrapbook/Music player',
  component: MusicPlayer,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <main className="home home--tiled"><Story /></main>],
} satisfies Meta<typeof MusicPlayer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Preview: Story = {};
export const LongTitles: Story = {
  args: { tracks: [{ id: 'long-title', title: 'A little longer on the way home — the extended evening version', artist: 'Scrapbook radio and the very long list of friends', duration: 240, coverColor: '#d8b4ae' }] },
};
