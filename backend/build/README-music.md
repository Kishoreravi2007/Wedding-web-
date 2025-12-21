# Wedding Music Setup

To add background music to your wedding website, please add your music files to this `public` folder:

## Required Files:
- `wedding-music.mp3` - Your main wedding music (MP3 format)
- `wedding-music.ogg` - Same music in OGG format (optional, for better browser support)

## Music File Specifications:
- **Format**: MP3 (primary) and OGG (fallback)
- **Length**: Recommended 3-5 minutes for looping
- **Quality**: 128-192kbps for good balance of quality and file size
- **Genre**: Wedding-appropriate music (instrumental, romantic, traditional)

## Example Commands to Add Music:
```bash
# Copy your music files to the public folder
cp /path/to/your/wedding-music.mp3 ./public/
cp /path/to/your/wedding-music.ogg ./public/
```

## Features:
- ✅ Autoplay when entering the website
- ✅ Floating music player controls
- ✅ Volume control and mute/unmute
- ✅ Mobile-friendly design
- ✅ Graceful fallback if music fails to load

## Browser Autoplay Policy:
Most modern browsers require user interaction before playing audio. The music player handles this automatically and will start playing after the first click/tap on the website.
