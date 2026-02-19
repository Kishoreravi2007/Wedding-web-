
// --- Advanced Theme Engine (Shared Config) ---
export type ThemeLayout = 'minimal-split' | 'luxury-serif' | 'rustic-overlay' | 'boho-frame' | 'modern-glass' | 'classic-centered' | 'cinematic-full' | 'editorial-fashion' | 'ethereal-garden' | 'stitch-professional' | 'professional-stitch-v2';

export interface ThemeConfig {
    layout: ThemeLayout;
    designerVersion?: number;
    fontHeading: string;
    fontBody: string;
    colors: {
        bg: string;
        text: string;
        accent: string;
        secondary: string;
    };
    radius: string;
    decoration: 'none' | 'floral' | 'geometric' | 'gold-border';
    defaultHeroImage: string;
    defaultStoryImage: string;
    timer: {
        container: string;
        text: string;
        subtext: string;
    };
}

const DEFAULT_HERO = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=2000&q=80';
const DEFAULT_STORY = 'https://images.unsplash.com/photo-1522673607200-1645062cd958?auto=format&fit=crop&w=1000&q=80';

export const themeConfigs: Record<string, ThemeConfig> = {
    // Premium "Designer v3" Themes (Native React)
    'Art Deco Glamour': {
        layout: 'professional-stitch-v2',
        designerVersion: 3,
        fontHeading: 'font-serif',
        fontBody: 'font-sans',
        colors: { bg: 'bg-deco-black', text: 'text-white', accent: 'text-gold', secondary: 'border-gold' },
        radius: 'rounded-none',
        decoration: 'geometric',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-black/40 border-gold/30', text: 'text-gold', subtext: 'text-gold/60' }
    },
    'Botanical Garden': {
        layout: 'professional-stitch-v2',
        designerVersion: 3,
        fontHeading: 'font-serif',
        fontBody: 'font-sans',
        colors: { bg: 'bg-emerald-50', text: 'text-emerald-950', accent: 'text-emerald-700', secondary: 'border-emerald-200' },
        radius: 'rounded-lg',
        decoration: 'floral',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-emerald-100 border-emerald-200', text: 'text-emerald-900', subtext: 'text-emerald-700/60' }
    },

    // Legacy React v1 Layouts
    'Minimal Split': {
        layout: 'minimal-split',
        fontHeading: 'font-serif',
        fontBody: 'font-sans',
        colors: { bg: 'bg-white', text: 'text-gray-900', accent: 'text-rose-500', secondary: 'border-gray-100' },
        radius: 'rounded-none',
        decoration: 'none',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-gray-50', text: 'text-gray-900', subtext: 'text-gray-500' }
    },
    'Luxury Serif': {
        layout: 'luxury-serif',
        fontHeading: 'font-serif',
        fontBody: 'font-serif',
        colors: { bg: 'bg-white', text: 'text-slate-900', accent: 'text-rose-600', secondary: 'border-rose-100' },
        radius: 'rounded-none',
        decoration: 'gold-border',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-rose-50', text: 'text-rose-900', subtext: 'text-rose-600' }
    }
};
