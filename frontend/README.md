<div align="center">
  <img src="https://img.icons8.com/plasticine/100/000000/wedding-rings.png" alt="Wedding Rings Icon" width="100"/>
  <h1 align="center">AI-Powered Wedding Photo Gallery</h1>
  <p align="center">
    A modern, feature-rich web application for sharing and managing wedding photos, enhanced with AI-powered face detection and personalization.
  </p>
  <p align="center">
    <a href="#-key-features"><strong>Key Features</strong></a> ·
    <a href="#-tech-stack"><strong>Tech Stack</strong></a> ·
    <a href="#-getting-started"><strong>Getting Started</strong></a> ·
    <a href="#-deployment"><strong>Deployment</strong></a>
  </p>
</div>

---

## ✨ Key Features

This application provides a beautiful and interactive experience for wedding guests and a powerful management tool for photographers and administrators.

### 📸 For Guests: An Interactive Photo Experience
- **Live Photo Booth**: Guests can take photos directly through the website using their device's camera, with custom wedding-themed overlays.
- **AI-Powered Photo Discovery**: A "Find My Photos" feature uses `face-api.js` to scan a guest's face and instantly curates a personalized gallery of all photos they appear in.
- **Themed Galleries**: Browse photos from two different weddings, each with its own unique color theme and style.
- **Advanced Filtering**: Easily search and filter the gallery by tags, events, and people.
- **Responsive Design**: A seamless experience on any device, from mobile phones to desktops.

###  For Photographers & Admins: Powerful Management Tools
- **Photographer Portal**: A dedicated dashboard for photographers to upload, manage, and tag photos.
- **AI Face Tagging**: Automatically detect faces in uploaded photos and tag recognized individuals.
- **People Management**: Maintain a database of wedding attendees for easy tagging and filtering.
- **Admin Dashboard**: A central hub for managing website content, schedules, music, and viewing analytics.
- **Drag-and-Drop Uploads**: An intuitive interface for batch-uploading photos.

## 🚀 Getting Started

Follow these steps to get the project running on your local machine.

### Prerequisites
- Node.js (v18 or later)
- npm, pnpm, or yarn

### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Kishoreravi2007/BLA.git
    cd BLA
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## 🛠️ Tech Stack

- **Core Framework**: React 18 with Vite
- **Language**: TypeScript
- **AI & Machine Learning**: face-api.js for client-side face detection and recognition.
- **Styling**: Tailwind CSS for utility-first styling.
- **UI Components**: shadcn/ui built on Radix UI.
- **Animations**: Framer Motion for smooth, declarative animations.
- **Routing**: React Router DOM for client-side routing.
- **Icons**: Lucide React for a beautiful and consistent icon set.

## 🏗️ Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   ├── PhotoGallery.tsx
│   ├── MusicPlayer.tsx
│   ├── PhotoBooth.tsx
│   └── ...
├── pages/              # Page components
│   ├── admin/          # Admin dashboard
│   ├── couple/         # Couple dashboard
│   ├── photographer/   # Photographer portal
│   ├── parvathy/       # Parvathy's specific pages
│   ├── sreedevi/       # Sreedevi's specific pages
│   └── ...
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── services/           # API services
└── utils/              # Helper utilities
```

## 🎨 Customization

### Adding New Event Types
1. Create new folders in `public/uploads/` for photos and music
2. Add event configuration in `src/data/schedules.ts`
3. Update navigation and routing as needed

### Styling
- Uses Tailwind CSS for styling
- Custom components built with Radix UI primitives
- Responsive design for mobile and desktop

### Music Management
- Place music files in `public/uploads/music/[event-type]/`
- Supported formats: MP3, WAV, OGG
- Background music automatically plays based on current page

## 📱 Pages & Features

### Public Pages
- **Home**: Welcome page with event overview
- **Photo Gallery**: Browse wedding photos by category
- **Wishes**: Guest message board
- **Event Invitation**: RSVP and event details

### Sister-Specific Pages
- **Parvathy's Layout**: Custom interface for Parvathy
- **Sreedevi's Layout**: Custom interface for Sreedevi
- **Photo Booth**: Interactive photo capture
- **Schedule**: Event timeline and details

### Admin Pages
- **Admin Dashboard**: Full administrative control
- **Photographer Dashboard**: Photo management tools
- **Couple Dashboard**: Wedding couple interface

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Deploy automatically on every push to main branch
3. Custom domain configuration available

### Manual Deployment
1. Build the project: `npm run build`
2. Upload `dist/` folder to your hosting provider
3. Configure server to serve `index.html` for all routes

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_APP_TITLE=Wedding Website
VITE_API_URL=your_api_url_here
```

### Music Configuration
- Place music files in appropriate folders under `public/uploads/music/`
- Update music player configuration in `src/components/MusicPlayer.tsx`

## 📸 Photo Management

### Upload Structure
```
public/uploads/wedding-photos/
├── ceremony/
├── reception/
├── mehendi/
├── muhurtham/
├── dakshina/
├── ganapathikidal/
└── other/
```

### Supported Formats
- Images: JPG, PNG, GIF, WebP
- Videos: MP4, WebM (if video support is added)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Dyad](https://dyad.sh) - AI-powered development platform
- UI components from [Shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Styling with [Tailwind CSS](https://tailwindcss.com)

## 📞 Support

For support and questions, please open an issue on GitHub or contact the development team at help.weddingweb@gmail.com.

---

**Made with ❤️ for your special day**
# BLA
# BLA
# BLA
# BLA
# BLA
# BLA
