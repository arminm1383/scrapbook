import { CharacterDepth } from './CharacterDepth';
import characterArtwork from '../assets/scrapbook/p6figure.png';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Storybook, LAST_SPREAD } from './Storybook';
import { ScrapbookPage } from './ScrapbookPages';

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
export const SecondSpread: Story = { args: { initialSpread: 2 } };
export const ThirdSpread: Story = { args: { initialSpread: 3 } };
export const FourthSpread: Story = { args: { initialSpread: 4 } };
export const BackCover: Story = { args: { initialSpread: LAST_SPREAD } };

export const PageThreeWinePour: Story = {
  render: () => (
    <div style={{ position: 'relative', width: 'min(474px, calc(100vw - 32px))', aspectRatio: '474 / 583' }}>
      <ScrapbookPage page={2} pageNumber={3} />
    </div>
  ),
};

export const PageSevenSwimmingVideo: Story = {
  render: () => (
    <div style={{ position: 'relative', width: 'min(474px, calc(100vw - 32px))', aspectRatio: '474 / 583' }}>
      <ScrapbookPage page={5} pageNumber={7} />
    </div>
  ),
};

export const PageEightCollage: Story = {
  render: () => (
    <div style={{ position: 'relative', width: 'min(474px, calc(100vw - 32px))', aspectRatio: '474 / 583' }}>
      <ScrapbookPage page={8} />
    </div>
  ),
};

export const PageSixGallery: Story = {
  render: () => (
    <div style={{ position: 'relative', width: 'min(474px, calc(100vw - 32px))', aspectRatio: '474 / 583' }}>
      <ScrapbookPage page={7} pageNumber={6} />
    </div>
  ),
};

export const CharacterSculpture: Story = {
  render: () => (
    <div className="artwork-crop" style={{ width: 'min(340px, calc(100vw - 32px))', aspectRatio: '255 / 383' }}>
      <CharacterDepth source={characterArtwork} />
    </div>
  ),
};
