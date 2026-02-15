
// --- Advanced Theme Engine (Shared Config) ---
export type ThemeLayout = 'minimal-split' | 'luxury-serif' | 'rustic-overlay' | 'boho-frame' | 'modern-glass' | 'classic-centered';

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
    timer: {
        container: string;
        text: string;
        subtext: string;
    };
}

export const themeConfigs: Record<string, ThemeConfig> = {
    // --- Originals ---
    'Modern Elegance': {
        layout: 'minimal-split',
        fontHeading: 'font-playfair',
        fontBody: 'font-montserrat',
        colors: { bg: 'bg-slate-900', text: 'text-white', accent: 'text-rose-400', secondary: 'text-gray-400' },
        radius: 'rounded-none',
        decoration: 'geometric',
        timer: { container: 'bg-white/10 border-white/20', text: 'text-white', subtext: 'text-white/70' }
    },
    'Classic Romance': {
        layout: 'classic-centered',
        fontHeading: 'font-playfair',
        fontBody: 'font-lato',
        colors: { bg: 'bg-rose-50', text: 'text-rose-900', accent: 'text-rose-500', secondary: 'text-rose-700' },
        radius: 'rounded-xl',
        decoration: 'floral',
        timer: { container: 'bg-rose-100/50 border-rose-200', text: 'text-rose-900', subtext: 'text-rose-600' }
    },
    'Rustic Charm': {
        layout: 'rustic-overlay',
        fontHeading: 'font-cinzel',
        fontBody: 'font-cormorant',
        colors: { bg: 'bg-stone-100', text: 'text-stone-800', accent: 'text-amber-600', secondary: 'text-stone-600' },
        radius: 'rounded-2xl',
        decoration: 'none',
        timer: { container: 'bg-amber-100/50 border-amber-200', text: 'text-amber-900', subtext: 'text-amber-600' }
    },
    'Royal Luxury': {
        layout: 'luxury-serif',
        fontHeading: 'font-cinzel',
        fontBody: 'font-montserrat',
        colors: { bg: 'bg-purple-950', text: 'text-purple-50', accent: 'text-yellow-400', secondary: 'text-purple-200' },
        radius: 'rounded-md',
        decoration: 'gold-border',
        timer: { container: 'bg-white/10 border-white/20', text: 'text-white', subtext: 'text-white/70' }
    },
    'Minimalist': {
        layout: 'minimal-split',
        fontHeading: 'font-raleway',
        fontBody: 'font-lato',
        colors: { bg: 'bg-white', text: 'text-gray-900', accent: 'text-gray-500', secondary: 'text-gray-400' },
        radius: 'rounded-none',
        decoration: 'none',
        timer: { container: 'bg-gray-100 border-gray-200', text: 'text-gray-900', subtext: 'text-gray-500' }
    },
    'Vintage Glamour': {
        layout: 'luxury-serif',
        fontHeading: 'font-playfair',
        fontBody: 'font-cormorant',
        colors: { bg: 'bg-[#e5dcd6]', text: 'text-[#4a403a]', accent: 'text-[#8a7060]', secondary: 'text-[#6a5a4a]' },
        radius: 'rounded-xl',
        decoration: 'gold-border',
        timer: { container: 'bg-[#4a403a]/10 border-[#4a403a]/20', text: 'text-[#4a403a]', subtext: 'text-[#4a403a]/70' }
    },
    'Boho Chic': {
        layout: 'boho-frame',
        fontHeading: 'font-alex-brush',
        fontBody: 'font-lato',
        colors: { bg: 'bg-[#fdf6e3]', text: 'text-[#5c4b37]', accent: 'text-[#8a7055]', secondary: 'text-[#7a6045]' },
        radius: 'rounded-2xl',
        decoration: 'floral',
        timer: { container: 'bg-[#5c4b37]/10 border-[#5c4b37]/20', text: 'text-[#5c4b37]', subtext: 'text-[#5c4b37]/70' }
    },
    'Beach Bliss': {
        layout: 'modern-glass',
        fontHeading: 'font-montserrat',
        fontBody: 'font-lato',
        colors: { bg: 'bg-cyan-50', text: 'text-cyan-900', accent: 'text-cyan-500', secondary: 'text-cyan-700' },
        radius: 'rounded-3xl',
        decoration: 'none',
        timer: { container: 'bg-cyan-100/50 border-cyan-200', text: 'text-cyan-900', subtext: 'text-cyan-600' }
    },

    // --- Nature ---
    'Forest Fern': {
        layout: 'rustic-overlay',
        fontHeading: 'font-playfair',
        fontBody: 'font-lato',
        colors: { bg: 'bg-emerald-900', text: 'text-emerald-50', accent: 'text-emerald-300', secondary: 'text-emerald-200' },
        radius: 'rounded-lg',
        decoration: 'none',
        timer: { container: 'bg-emerald-100/20 border-emerald-200/30', text: 'text-emerald-50', subtext: 'text-emerald-200' }
    },
    'Ocean Breeze': {
        layout: 'minimal-split',
        fontHeading: 'font-montserrat',
        fontBody: 'font-lato',
        colors: { bg: 'bg-sky-50', text: 'text-sky-900', accent: 'text-sky-500', secondary: 'text-sky-700' },
        radius: 'rounded-3xl',
        decoration: 'none',
        timer: { container: 'bg-white/30 border-white/40', text: 'text-sky-900', subtext: 'text-sky-700' }
    },
    'Sunset Glow': {
        layout: 'minimal-split', fontHeading: 'font-playfair', fontBody: 'font-lato',
        colors: { bg: 'bg-orange-50', text: 'text-orange-900', accent: 'text-orange-500', secondary: 'text-orange-700' },
        radius: 'rounded-lg', decoration: 'none',
        timer: { container: 'bg-white/30 border-white/40', text: 'text-orange-900', subtext: 'text-orange-700' }
    },
    'Mountain Mist': {
        layout: 'rustic-overlay', fontHeading: 'font-raleway', fontBody: 'font-sans',
        colors: { bg: 'bg-gray-100', text: 'text-slate-800', accent: 'text-slate-500', secondary: 'text-slate-600' },
        radius: 'rounded-sm', decoration: 'none',
        timer: { container: 'bg-slate-300/30 border-slate-400/30', text: 'text-slate-800', subtext: 'text-slate-600' }
    },
    'Desert Bloom': {
        layout: 'boho-frame', fontHeading: 'font-playfair', fontBody: 'font-lato',
        colors: { bg: 'bg-rose-100', text: 'text-stone-800', accent: 'text-stone-500', secondary: 'text-stone-600' },
        radius: 'rounded-2xl', decoration: 'none',
        timer: { container: 'bg-rose-900/10 border-rose-900/20', text: 'text-stone-800', subtext: 'text-stone-600' }
    },

    // --- Classic ---
    'Gold & Ivory': {
        layout: 'luxury-serif',
        fontHeading: 'font-alex-brush',
        fontBody: 'font-poppins',
        colors: { bg: 'bg-[#fffff0]', text: 'text-[#c5a059]', accent: 'text-[#d4af37]', secondary: 'text-[#8a7e5f]' },
        radius: 'rounded-sm',
        decoration: 'gold-border',
        timer: { container: 'bg-[#c5a059]/10 border-[#c5a059]/30', text: 'text-[#c5a059]', subtext: 'text-[#c5a059]/70' }
    },
    'Black Tie': {
        layout: 'minimal-split',
        fontHeading: 'font-playfair',
        fontBody: 'font-lato',
        colors: { bg: 'bg-neutral-950', text: 'text-white', accent: 'text-neutral-400', secondary: 'text-neutral-500' },
        radius: 'rounded-none',
        decoration: 'geometric',
        timer: { container: 'bg-white/10 border-white/20', text: 'text-white', subtext: 'text-neutral-400' }
    },
    'Silver Soiree': {
        layout: 'luxury-serif', fontHeading: 'font-playfair', fontBody: 'font-lato',
        colors: { bg: 'bg-slate-50', text: 'text-slate-600', accent: 'text-slate-400', secondary: 'text-slate-500' },
        radius: 'rounded-md', decoration: 'none',
        timer: { container: 'bg-slate-300/40 border-slate-400', text: 'text-slate-700', subtext: 'text-slate-500' }
    },
    'Pearl White': {
        layout: 'classic-centered', fontHeading: 'font-playfair', fontBody: 'font-lato',
        colors: { bg: 'bg-white', text: 'text-stone-500', accent: 'text-stone-400', secondary: 'text-stone-300' },
        radius: 'rounded-full', decoration: 'none',
        timer: { container: 'bg-gray-100 border-gray-200', text: 'text-stone-500', subtext: 'text-stone-400' }
    },
    'Champagne Toast': {
        layout: 'luxury-serif', fontHeading: 'font-alex-brush', fontBody: 'font-poppins',
        colors: { bg: 'bg-[#f7e7ce]', text: 'text-[#5c5346]', accent: 'text-[#8e7e6a]', secondary: 'text-[#a69886]' },
        radius: 'rounded-lg', decoration: 'none',
        timer: { container: 'bg-[#5c5346]/10 border-[#5c5346]/20', text: 'text-[#5c5346]', subtext: 'text-[#5c5346]/70' }
    },

    // --- Modern ---
    'City Lights': {
        layout: 'modern-glass',
        fontHeading: 'font-montserrat',
        fontBody: 'font-lato',
        colors: { bg: 'bg-zinc-950', text: 'text-yellow-50', accent: 'text-yellow-400', secondary: 'text-zinc-400' },
        radius: 'rounded-none',
        decoration: 'none',
        timer: { container: 'bg-yellow-400/20 border-yellow-400/30', text: 'text-yellow-100', subtext: 'text-yellow-200/70' }
    },
    'Midnight Blue': {
        layout: 'modern-glass',
        fontHeading: 'font-cormorant',
        fontBody: 'font-montserrat',
        colors: { bg: 'bg-[#0f172a]', text: 'text-blue-50', accent: 'text-blue-400', secondary: 'text-blue-200' },
        radius: 'rounded-xl',
        decoration: 'geometric',
        timer: { container: 'bg-white/10 border-white/20', text: 'text-blue-50', subtext: 'text-blue-200' }
    },
    'Charcoal & Rose': {
        layout: 'minimal-split', fontHeading: 'font-playfair', fontBody: 'font-lato',
        colors: { bg: 'bg-stone-800', text: 'text-rose-200', accent: 'text-rose-400', secondary: 'text-stone-600' },
        radius: 'rounded-none', decoration: 'none',
        timer: { container: 'bg-rose-200/20 border-rose-200/30', text: 'text-rose-200', subtext: 'text-rose-300/70' }
    },
    'Monochrome': {
        layout: 'minimal-split', fontHeading: 'font-montserrat', fontBody: 'font-lato',
        colors: { bg: 'bg-white', text: 'text-black', accent: 'text-gray-800', secondary: 'text-gray-400' },
        radius: 'rounded-none', decoration: 'geometric',
        timer: { container: 'bg-black text-white border-2 border-black', text: 'text-white', subtext: 'text-gray-300' }
    },
    'Geometric Pop': {
        layout: 'modern-glass', fontHeading: 'font-raleway', fontBody: 'font-lato',
        colors: { bg: 'bg-white', text: 'text-indigo-600', accent: 'text-indigo-400', secondary: 'text-indigo-200' },
        radius: 'rounded-lg', decoration: 'geometric',
        timer: { container: 'bg-indigo-100/50 border-indigo-200', text: 'text-indigo-600', subtext: 'text-indigo-400' }
    },

    // --- Romantic ---
    'Blushing Bride': {
        layout: 'boho-frame',
        fontHeading: 'font-great-vibes',
        fontBody: 'font-raleway',
        colors: { bg: 'bg-pink-50', text: 'text-pink-900', accent: 'text-pink-400', secondary: 'text-pink-700' },
        radius: 'rounded-[3rem]',
        decoration: 'floral',
        timer: { container: 'bg-white/40 border-white/50', text: 'text-pink-900', subtext: 'text-pink-700' }
    },
    'Lavender Haze': {
        layout: 'boho-frame',
        fontHeading: 'font-alex-brush',
        fontBody: 'font-lato',
        colors: { bg: 'bg-purple-50', text: 'text-purple-900', accent: 'text-purple-400', secondary: 'text-purple-700' },
        radius: 'rounded-2xl',
        decoration: 'floral',
        timer: { container: 'bg-white/40 border-white/50', text: 'text-purple-900', subtext: 'text-purple-700' }
    },
    'Peachy Keen': {
        layout: 'boho-frame', fontHeading: 'font-playfair', fontBody: 'font-lato',
        colors: { bg: 'bg-orange-100', text: 'text-orange-800', accent: 'text-orange-500', secondary: 'text-orange-600' },
        radius: 'rounded-3xl', decoration: 'none',
        timer: { container: 'bg-white/40 border-white/50', text: 'text-orange-900', subtext: 'text-orange-700' }
    },
    'Red Velvet': {
        layout: 'luxury-serif', fontHeading: 'font-cinzel', fontBody: 'font-lato',
        colors: { bg: 'bg-red-900', text: 'text-rose-50', accent: 'text-rose-200', secondary: 'text-red-700' },
        radius: 'rounded-md', decoration: 'none',
        timer: { container: 'bg-white/10 border-white/20', text: 'text-rose-50', subtext: 'text-rose-200' }
    },
    'Sweetheart Pink': {
        layout: 'classic-centered', fontHeading: 'font-playfair', fontBody: 'font-lato',
        colors: { bg: 'bg-rose-200', text: 'text-rose-900', accent: 'text-rose-600', secondary: 'text-rose-800' },
        radius: 'rounded-xl', decoration: 'none',
        timer: { container: 'bg-white/40 border-white/50', text: 'text-rose-900', subtext: 'text-rose-700' }
    },

    // --- Cultural ---
    'Royal Red': {
        layout: 'luxury-serif',
        fontHeading: 'font-cinzel',
        fontBody: 'font-poppins',
        colors: { bg: 'bg-red-900', text: 'text-amber-50', accent: 'text-amber-400', secondary: 'text-red-200' },
        radius: 'rounded-none',
        decoration: 'gold-border',
        timer: { container: 'bg-amber-400/20 border-amber-400/30', text: 'text-amber-50', subtext: 'text-amber-200' }
    },
    'Teal & Gold': {
        layout: 'luxury-serif',
        fontHeading: 'font-cormorant',
        fontBody: 'font-raleway',
        colors: { bg: 'bg-teal-900', text: 'text-teal-50', accent: 'text-amber-300', secondary: 'text-teal-200' },
        radius: 'rounded-lg',
        decoration: 'gold-border',
        timer: { container: 'bg-amber-300/20 border-amber-300/30', text: 'text-teal-50', subtext: 'text-teal-200' }
    },
    'Saffron Sun': {
        layout: 'rustic-overlay', fontHeading: 'font-playfair', fontBody: 'font-lato',
        colors: { bg: 'bg-yellow-500', text: 'text-red-900', accent: 'text-red-700', secondary: 'text-yellow-700' },
        radius: 'rounded-lg', decoration: 'none',
        timer: { container: 'bg-red-900/10 border-red-900/20', text: 'text-red-900', subtext: 'text-red-700' }
    },
    'Magenta Magic': {
        layout: 'modern-glass', fontHeading: 'font-montserrat', fontBody: 'font-lato',
        colors: { bg: 'bg-fuchsia-800', text: 'text-fuchsia-100', accent: 'text-fuchsia-300', secondary: 'text-fuchsia-600' },
        radius: 'rounded-xl', decoration: 'none',
        timer: { container: 'bg-fuchsia-100/20 border-fuchsia-200/30', text: 'text-fuchsia-100', subtext: 'text-fuchsia-300' }
    },
    'Emerald Elegance': {
        layout: 'luxury-serif', fontHeading: 'font-playfair', fontBody: 'font-lato',
        colors: { bg: 'bg-emerald-800', text: 'text-emerald-100', accent: 'text-emerald-400', secondary: 'text-emerald-600' },
        radius: 'rounded-md', decoration: 'none',
        timer: { container: 'bg-emerald-100/20 border-emerald-200/30', text: 'text-emerald-100', subtext: 'text-emerald-300' }
    },

    // --- Botanical (The Knot Inspired) ---
    'Botanical Blooms': {
        layout: 'boho-frame', fontHeading: 'font-great-vibes', fontBody: 'font-lato',
        colors: { bg: 'bg-[#f5f0eb]', text: 'text-[#3d5a4c]', accent: 'text-[#6b8f71]', secondary: 'text-[#7a9a7e]' },
        radius: 'rounded-2xl', decoration: 'floral',
        timer: { container: 'bg-[#3d5a4c]/10 border-[#3d5a4c]/20', text: 'text-[#3d5a4c]', subtext: 'text-[#3d5a4c]/70' }
    },
    'Garden Party': {
        layout: 'classic-centered', fontHeading: 'font-cormorant', fontBody: 'font-lato',
        colors: { bg: 'bg-[#eef3e5]', text: 'text-[#2d4a2d]', accent: 'text-[#5a8a5a]', secondary: 'text-[#4a6b4a]' },
        radius: 'rounded-xl', decoration: 'floral',
        timer: { container: 'bg-[#2d4a2d]/10 border-[#2d4a2d]/20', text: 'text-[#2d4a2d]', subtext: 'text-[#2d4a2d]/70' }
    },
    'Tropical Paradise': {
        layout: 'modern-glass', fontHeading: 'font-montserrat', fontBody: 'font-lato',
        colors: { bg: 'bg-[#0a4d3a]', text: 'text-emerald-50', accent: 'text-emerald-300', secondary: 'text-emerald-200' },
        radius: 'rounded-lg', decoration: 'none',
        timer: { container: 'bg-emerald-50/20 border-emerald-50/30', text: 'text-emerald-50', subtext: 'text-emerald-200' }
    },

    // --- Ethereal ---
    'Ethereal Blur': {
        layout: 'minimal-split', fontHeading: 'font-playfair', fontBody: 'font-lato',
        colors: { bg: 'bg-violet-100', text: 'text-violet-900', accent: 'text-violet-500', secondary: 'text-violet-700' },
        radius: 'rounded-3xl', decoration: 'none',
        timer: { container: 'bg-white/30 border-white/40', text: 'text-violet-900', subtext: 'text-violet-700' }
    },
    'Dreamy Watercolor': {
        layout: 'boho-frame', fontHeading: 'font-alex-brush', fontBody: 'font-lato',
        colors: { bg: 'bg-[#f0e6f3]', text: 'text-[#5b3a6b]', accent: 'text-[#8a5fa0]', secondary: 'text-[#7a5090]' },
        radius: 'rounded-2xl', decoration: 'floral',
        timer: { container: 'bg-[#5b3a6b]/10 border-[#5b3a6b]/20', text: 'text-[#5b3a6b]', subtext: 'text-[#5b3a6b]/70' }
    },

    // --- Destination ---
    'Amalfi Coast': {
        layout: 'modern-glass', fontHeading: 'font-cormorant', fontBody: 'font-montserrat',
        colors: { bg: 'bg-[#1a4063]', text: 'text-amber-50', accent: 'text-amber-300', secondary: 'text-sky-200' },
        radius: 'rounded-xl', decoration: 'none',
        timer: { container: 'bg-amber-50/20 border-amber-50/30', text: 'text-amber-50', subtext: 'text-amber-200' }
    },
    'Tuscan Villa': {
        layout: 'rustic-overlay', fontHeading: 'font-cinzel', fontBody: 'font-lato',
        colors: { bg: 'bg-[#f5eadb]', text: 'text-[#6b4423]', accent: 'text-[#a0673a]', secondary: 'text-[#8a5a30]' },
        radius: 'rounded-lg', decoration: 'none',
        timer: { container: 'bg-[#6b4423]/10 border-[#6b4423]/20', text: 'text-[#6b4423]', subtext: 'text-[#6b4423]/70' }
    },
    'Parisian Romance': {
        layout: 'luxury-serif', fontHeading: 'font-playfair', fontBody: 'font-lato',
        colors: { bg: 'bg-[#f7f0f5]', text: 'text-[#3d2845]', accent: 'text-[#b8860b]', secondary: 'text-[#5a3a6b]' },
        radius: 'rounded-md', decoration: 'gold-border',
        timer: { container: 'bg-[#3d2845]/10 border-[#3d2845]/20', text: 'text-[#3d2845]', subtext: 'text-[#3d2845]/70' }
    },

    // --- Vintage / Retro ---
    'Art Deco Glam': {
        layout: 'luxury-serif', fontHeading: 'font-cinzel', fontBody: 'font-montserrat',
        colors: { bg: 'bg-[#1a1a2e]', text: 'text-[#d4af37]', accent: 'text-[#f0d060]', secondary: 'text-[#a08830]' },
        radius: 'rounded-none', decoration: 'gold-border',
        timer: { container: 'bg-[#d4af37]/20 border-[#d4af37]/40', text: 'text-[#d4af37]', subtext: 'text-[#d4af37]/70' }
    },
    'Vintage Lace': {
        layout: 'classic-centered', fontHeading: 'font-playfair', fontBody: 'font-lato',
        colors: { bg: 'bg-[#faf6f0]', text: 'text-[#5c4a3a]', accent: 'text-[#8a7060]', secondary: 'text-[#7a6050]' },
        radius: 'rounded-xl', decoration: 'floral',
        timer: { container: 'bg-[#5c4a3a]/10 border-[#5c4a3a]/20', text: 'text-[#5c4a3a]', subtext: 'text-[#5c4a3a]/70' }
    },

    // --- Seasonal ---
    'Autumn Harvest': {
        layout: 'rustic-overlay', fontHeading: 'font-cormorant', fontBody: 'font-lato',
        colors: { bg: 'bg-[#4a2c17]', text: 'text-amber-100', accent: 'text-amber-400', secondary: 'text-amber-200' },
        radius: 'rounded-lg', decoration: 'none',
        timer: { container: 'bg-amber-100/20 border-amber-100/30', text: 'text-amber-100', subtext: 'text-amber-200' }
    },
    'Winter Wonderland': {
        layout: 'modern-glass', fontHeading: 'font-raleway', fontBody: 'font-lato',
        colors: { bg: 'bg-[#1a2744]', text: 'text-[#e8f0fe]', accent: 'text-sky-300', secondary: 'text-sky-200' },
        radius: 'rounded-xl', decoration: 'geometric',
        timer: { container: 'bg-sky-300/20 border-sky-300/30', text: 'text-[#e8f0fe]', subtext: 'text-sky-200' }
    },
    'Spring Blossom': {
        layout: 'boho-frame', fontHeading: 'font-great-vibes', fontBody: 'font-raleway',
        colors: { bg: 'bg-[#fff5f5]', text: 'text-[#c0506b]', accent: 'text-[#e07090]', secondary: 'text-[#d06080]' },
        radius: 'rounded-3xl', decoration: 'floral',
        timer: { container: 'bg-[#c0506b]/10 border-[#c0506b]/20', text: 'text-[#c0506b]', subtext: 'text-[#c0506b]/70' }
    },

    // --- Statement ---
    'Moody Romance': {
        layout: 'minimal-split', fontHeading: 'font-playfair', fontBody: 'font-lato',
        colors: { bg: 'bg-[#1a1a1a]', text: 'text-[#d4a89a]', accent: 'text-[#e0b8aa]', secondary: 'text-[#8a6a5a]' },
        radius: 'rounded-none', decoration: 'none',
        timer: { container: 'bg-[#d4a89a]/20 border-[#d4a89a]/30', text: 'text-[#d4a89a]', subtext: 'text-[#d4a89a]/70' }
    },
    'Whimsical Garden': {
        layout: 'boho-frame', fontHeading: 'font-alex-brush', fontBody: 'font-lato',
        colors: { bg: 'bg-[#fef9ef]', text: 'text-[#5c6b3a]', accent: 'text-[#8a9a5a]', secondary: 'text-[#7a8a4a]' },
        radius: 'rounded-2xl', decoration: 'floral',
        timer: { container: 'bg-[#5c6b3a]/10 border-[#5c6b3a]/20', text: 'text-[#5c6b3a]', subtext: 'text-[#5c6b3a]/70' }
    }
};
