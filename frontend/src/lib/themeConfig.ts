
// --- Advanced Theme Engine (Shared Config) ---
export type ThemeLayout = 'minimal-split' | 'luxury-serif' | 'rustic-overlay' | 'boho-frame' | 'modern-glass' | 'classic-centered' | 'cinematic-full' | 'editorial-fashion' | 'ethereal-garden' | 'stitch-professional' | 'professional-stitch-v2';

export interface ThemeConfig {
    layout: ThemeLayout;
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
    // Premium "Stitched" Themes
    'Art Deco Glamour': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-serif',
        fontBody: 'font-sans',
        colors: { bg: 'bg-deco-black', text: 'text-white', accent: 'text-gold', secondary: 'border-gold' },
        radius: 'rounded-none',
        decoration: 'geometric',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-black/40 border-gold/30', text: 'text-gold', subtext: 'text-gold/60' }
    },
    'Autumn Harvest (Premium)': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-serif',
        fontBody: 'font-sans',
        colors: { bg: 'bg-stone-50', text: 'text-stone-900', accent: 'text-orange-800', secondary: 'border-orange-200' },
        radius: 'rounded-sm',
        decoration: 'none',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-orange-50 border-orange-200', text: 'text-orange-900', subtext: 'text-orange-800/60' }
    },
    'Botanical Garden': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-serif',
        fontBody: 'font-sans',
        colors: { bg: 'bg-emerald-50', text: 'text-emerald-950', accent: 'text-emerald-700', secondary: 'border-emerald-200' },
        radius: 'rounded-lg',
        decoration: 'floral',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-emerald-100 border-emerald-200', text: 'text-emerald-900', subtext: 'text-emerald-700/60' }
    },
    'Coastal Dream': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-sans',
        fontBody: 'font-sans',
        colors: { bg: 'bg-sky-50', text: 'text-sky-950', accent: 'text-sky-600', secondary: 'border-sky-200' },
        radius: 'rounded-xl',
        decoration: 'none',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-white/80 border-sky-100', text: 'text-sky-900', subtext: 'text-sky-500' }
    },
    'Contemporary Grace': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-sans',
        fontBody: 'font-sans',
        colors: { bg: 'bg-zinc-50', text: 'text-zinc-900', accent: 'text-zinc-600', secondary: 'border-zinc-200' },
        radius: 'rounded-none',
        decoration: 'none',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-white border-zinc-200', text: 'text-zinc-900', subtext: 'text-zinc-500' }
    },
    'Desert Oasis': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-serif',
        fontBody: 'font-sans',
        colors: { bg: 'bg-orange-50', text: 'text-orange-950', accent: 'text-orange-700', secondary: 'border-orange-200' },
        radius: 'rounded-md',
        decoration: 'geometric',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-orange-100 border-orange-200', text: 'text-orange-900', subtext: 'text-orange-700' }
    },
    'Enchanted Forest': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-serif',
        fontBody: 'font-sans',
        colors: { bg: 'bg-green-950', text: 'text-green-50', accent: 'text-green-400', secondary: 'border-green-800' },
        radius: 'rounded-full',
        decoration: 'floral',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-green-900/40 border-green-700', text: 'text-green-100', subtext: 'text-green-400' }
    },
    'Hollywood Regency': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-serif',
        fontBody: 'font-sans',
        colors: { bg: 'bg-neutral-950', text: 'text-neutral-100', accent: 'text-rose-500', secondary: 'border-rose-900' },
        radius: 'rounded-none',
        decoration: 'gold-border',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-neutral-900 border-rose-900', text: 'text-rose-500', subtext: 'text-neutral-400' }
    },
    'Industrial Chic': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-sans',
        fontBody: 'font-sans',
        colors: { bg: 'bg-stone-100', text: 'text-stone-900', accent: 'text-stone-600', secondary: 'border-stone-300' },
        radius: 'rounded-none',
        decoration: 'none',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-white border-stone-300', text: 'text-stone-900', subtext: 'text-stone-500' }
    },
    'Lakeside Serenity': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-serif',
        fontBody: 'font-sans',
        colors: { bg: 'bg-slate-50', text: 'text-slate-900', accent: 'text-slate-600', secondary: 'border-slate-200' },
        radius: 'rounded-lg',
        decoration: 'none',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-white border-slate-200', text: 'text-slate-900', subtext: 'text-slate-500' }
    },
    'Midnight Gala': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-serif',
        fontBody: 'font-sans',
        colors: { bg: 'bg-navy-950', text: 'text-white', accent: 'text-amber-400', secondary: 'border-amber-900' },
        radius: 'rounded-sm',
        decoration: 'gold-border',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-navy-900 border-amber-900/50', text: 'text-amber-400', subtext: 'text-white/60' }
    },
    'Mountain Retreat': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-serif',
        fontBody: 'font-sans',
        colors: { bg: 'bg-zinc-100', text: 'text-zinc-900', accent: 'text-zinc-700', secondary: 'border-zinc-300' },
        radius: 'rounded-none',
        decoration: 'none',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-white border-zinc-300', text: 'text-zinc-900', subtext: 'text-zinc-500' }
    },
    'Pure Minimalist': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-sans',
        fontBody: 'font-sans',
        colors: { bg: 'bg-white', text: 'text-neutral-900', accent: 'text-neutral-500', secondary: 'border-neutral-100' },
        radius: 'rounded-none',
        decoration: 'none',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-neutral-50 border-neutral-100', text: 'text-neutral-900', subtext: 'text-neutral-400' }
    },
    'Retro Revival': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-sans',
        fontBody: 'font-sans',
        colors: { bg: 'bg-orange-50', text: 'text-orange-900', accent: 'text-orange-600', secondary: 'border-orange-200' },
        radius: 'rounded-2xl',
        decoration: 'geometric',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-white border-orange-200', text: 'text-orange-900', subtext: 'text-orange-500' }
    },
    'Rustic Barn': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-serif',
        fontBody: 'font-sans',
        colors: { bg: 'bg-stone-50', text: 'text-stone-900', accent: 'text-stone-700', secondary: 'border-stone-200' },
        radius: 'rounded-md',
        decoration: 'none',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-stone-100 border-stone-200', text: 'text-stone-900', subtext: 'text-stone-600' }
    },
    'Spring Bloom': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-serif',
        fontBody: 'font-sans',
        colors: { bg: 'bg-rose-50', text: 'text-rose-950', accent: 'text-rose-600', secondary: 'border-rose-200' },
        radius: 'rounded-3xl',
        decoration: 'floral',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-white border-rose-100', text: 'text-rose-900', subtext: 'text-rose-400' }
    },
    'Timeless Vintage': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-serif',
        fontBody: 'font-sans',
        colors: { bg: 'bg-ivory-50', text: 'text-stone-900', accent: 'text-amber-700', secondary: 'border-amber-200' },
        radius: 'rounded-sm',
        decoration: 'gold-border',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-white/60 border-amber-100', text: 'text-stone-900', subtext: 'text-amber-700' }
    },
    'Tropical Paradise': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-serif',
        fontBody: 'font-sans',
        colors: { bg: 'bg-teal-50', text: 'text-teal-950', accent: 'text-teal-600', secondary: 'border-teal-200' },
        radius: 'rounded-lg',
        decoration: 'floral',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-teal-100 border-teal-200', text: 'text-teal-900', subtext: 'text-teal-600' }
    },
    'Urban Loft': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-sans',
        fontBody: 'font-sans',
        colors: { bg: 'bg-neutral-100', text: 'text-neutral-900', accent: 'text-neutral-600', secondary: 'border-neutral-300' },
        radius: 'rounded-none',
        decoration: 'none',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-white border-neutral-300', text: 'text-neutral-900', subtext: 'text-neutral-500' }
    },
    'Victorian Elegance': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-serif',
        fontBody: 'font-sans',
        colors: { bg: 'bg-stone-50', text: 'text-stone-900', accent: 'text-stone-700', secondary: 'border-stone-200' },
        radius: 'rounded-sm',
        decoration: 'floral',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-stone-100 border-stone-200', text: 'text-stone-900', subtext: 'text-stone-600' }
    },
    'Winter Wonderland': {
        layout: 'professional-stitch-v2',
        fontHeading: 'font-serif',
        fontBody: 'font-sans',
        colors: { bg: 'bg-blue-50', text: 'text-blue-950', accent: 'text-blue-600', secondary: 'border-blue-200' },
        radius: 'rounded-none',
        decoration: 'none',
        defaultHeroImage: DEFAULT_HERO,
        defaultStoryImage: DEFAULT_STORY,
        timer: { container: 'bg-white border-blue-100', text: 'text-blue-900', subtext: 'text-blue-500' }
    }
};
