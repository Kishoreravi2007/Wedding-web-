# 🚀 WeddingWeb Company Website - Quick Start Guide

## ✅ What's Been Added

Your Wedding Web project has been successfully transformed into a professional company website! Here's what's new:

### 📄 6 New Company Pages

1. **Landing Page** (`/company`) - Main company homepage
2. **About Us** (`/company/about`) - Company story and team
3. **Services** (`/company/services`) - Detailed features
4. **Pricing** (`/company/pricing`) - Plans and packages
5. **Portfolio** (`/company/portfolio`) - Success stories
6. **Contact** (`/company/contact`) - Contact form and info

### 🎨 Features Included

✅ Professional design with gradient themes
✅ Responsive mobile-first layout
✅ Smooth animations with Framer Motion
✅ Clear call-to-action buttons
✅ Testimonials and social proof
✅ Three-tier pricing structure
✅ Contact form with multiple channels
✅ SEO-ready structure

## 🌐 How to Access

### View the Company Website

1. **Start your development server:**
```bash
cd frontend
npm run dev
```

2. **Visit these URLs:**
- Main Landing: `http://localhost:5173/company`
- About Us: `http://localhost:5173/company/about`
- Services: `http://localhost:5173/company/services`
- Pricing: `http://localhost:5173/company/pricing`
- Portfolio: `http://localhost:5173/company/portfolio`
- Contact: `http://localhost:5173/company/contact`

3. **Home page banner:** A prominent banner on the main index page (`/`) now links to `/company`

## 🎯 Key Customization Points

### 1. Company Branding

**Current Settings:**
- Company Name: "WeddingWeb"
- Email: help.weddingweb@gmail.com
- Colors: Rose, Purple, Indigo gradients

**To Customize:**
- Update company name in all 6 page files
- Change email addresses in Contact page
- Add your logo (replace Heart icon)
- Update color scheme in Tailwind classes

### 2. Pricing

**Current Plans:**
- Starter: $99/month
- Professional: $199/month (Most Popular)
- Enterprise: $499/month

**To Modify:**
Edit `frontend/src/pages/company/Pricing.tsx`:
```typescript
const plans = [
  {
    name: "Starter",
    monthlyPrice: 99,  // Change these values
    yearlyPrice: 999,
    // ... features
  },
  // ... other plans
];
```

### 3. Contact Information

**To Update:**
Edit `frontend/src/pages/company/Contact.tsx`:
```typescript
const contactMethods = [
  {
    title: "Email Us",
    value: "help.weddingweb@gmail.com",  // Change email
    // ...
  },
  {
    title: "Call Us",
    value: "+91 XXX-XXX-XXXX",  // Add phone number
    // ...
  },
];

const offices = [
  {
    city: "Bangalore",  // Change locations
    address: "HSR Layout, Sector 1",
    // ...
  },
];
```

### 4. Testimonials

**To Add Real Testimonials:**
Edit Portfolio.tsx and Landing.tsx:
```typescript
const testimonials = [
  {
    name: "Your Client Name",
    event: "Wedding • Location",
    text: "Their testimonial quote...",
    rating: 5
  },
  // Add more...
];
```

### 5. Case Studies

**To Add Real Projects:**
Edit `frontend/src/pages/company/Portfolio.tsx`:
```typescript
const caseStudies = [
  {
    couple: "Client Names",
    location: "City, Country",
    date: "Month Year",
    guests: 500,
    photos: 8500,
    image: "/path-to-image.jpg",  // Add real photos
    testimonial: "Quote from client...",
    // ... metrics
  },
];
```

## 🖼️ Adding Your Own Images

### Logo
Replace the Heart icon with your logo:
```typescript
// In all navigation sections:
<Heart className="w-8 h-8 text-rose-500" />
// Replace with:
<img src="/your-logo.png" alt="Company Logo" className="w-8 h-8" />
```

### Hero Images
Add background images to pages:
```typescript
// In any page, add:
<div 
  className="background-image"
  style={{ backgroundImage: "url('/your-hero-image.jpg')" }}
/>
```

### Case Study Photos
1. Add images to `frontend/public/` folder
2. Update image paths in Portfolio.tsx
3. Use high-quality wedding photos (recommended: 1920x1080)

## 📧 Setting Up Contact Form

### Backend Integration

The contact form currently shows an alert. To make it functional:

1. **Option A: Email Service (Recommended)**
```typescript
// In Contact.tsx, update handleSubmit:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await fetch('YOUR_API_ENDPOINT', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      alert('Thank you! We\'ll contact you soon.');
      setFormData({ name: '', email: '', phone: '', eventDate: '', guestCount: '', message: '' });
    }
  } catch (error) {
    alert('Error sending message. Please try again.');
  }
};
```

2. **Option B: EmailJS (No Backend)**
```bash
npm install @emailjs/browser
```

```typescript
import emailjs from '@emailjs/browser';

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  emailjs.send(
    'YOUR_SERVICE_ID',
    'YOUR_TEMPLATE_ID',
    formData,
    'YOUR_PUBLIC_KEY'
  ).then(() => {
    alert('Message sent successfully!');
  });
};
```

3. **Option C: Backend API**
Create an endpoint in your backend:
```javascript
// backend/contact.js
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  // Send email using nodemailer or your email service
});
```

## 🎨 Customizing Design

### Colors
The site uses Tailwind CSS. Main colors:
- Rose: `from-rose-500 to-rose-600`
- Purple: `from-purple-500 to-purple-600`
- Indigo: `from-indigo-500 to-indigo-600`

To change the color scheme, replace these classes throughout the pages.

### Fonts
Add custom fonts in `frontend/index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font&display=swap" rel="stylesheet">
```

Then update in `frontend/src/globals.css` or Tailwind config.

## 🔧 Advanced Features to Add

### 1. Live Demo Booking
Integrate with Calendly or similar:
```typescript
<Button onClick={() => window.open('https://calendly.com/your-link')}>
  Book a Demo
</Button>
```

### 2. Live Chat
Add Intercom, Drift, or Tawk.to:
```html
<!-- Add script to frontend/index.html -->
<script>
  // Your chat widget code
</script>
```

### 3. Analytics
Add Google Analytics or Plausible:
```html
<!-- frontend/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_ID"></script>
```

### 4. Blog Section
Create `frontend/src/pages/company/Blog.tsx`:
```typescript
// Add blog posts, SEO content, wedding tips
```

## 📱 Mobile Optimization

All pages are mobile-responsive. Test on:
- Mobile (320px - 768px)
- Tablet (768px - 1024px)
- Desktop (1024px+)

## 🚀 Deployment

### Netlify/Vercel Deployment
Your existing deployment configs work! The company pages will be automatically included.

**Important:** Update your environment variables:
```
VITE_API_BASE_URL=https://your-backend-url.com
```

### Custom Domain
1. Purchase domain (e.g., weddingweb.com)
2. Point DNS to your hosting
3. Update domain in hosting dashboard

### SEO Setup
Add to `frontend/index.html`:
```html
<meta name="description" content="WeddingWeb - AI-Powered Wedding Technology Platform">
<meta property="og:title" content="WeddingWeb">
<meta property="og:description" content="Make your wedding unforgettable with AI face detection...">
<meta property="og:image" content="/og-image.jpg">
```

## 📊 Next Steps

### Immediate Actions
1. ✅ Update company contact information
2. ✅ Add real testimonials and case studies
3. ✅ Upload high-quality images
4. ✅ Configure contact form backend
5. ✅ Add your logo
6. ✅ Test on mobile devices

### Marketing
1. Create social media accounts
2. Set up Google Business Profile
3. Create blog content
4. Start email marketing
5. Run Google/Facebook ads

### Features
1. Add live chat widget
2. Implement demo booking system
3. Create blog section
4. Add FAQ page
5. Implement referral system

## 🆘 Troubleshooting

### Issue: Pages don't show up
**Solution:** Make sure frontend dev server is running: `npm run dev`

### Issue: Images not loading
**Solution:** Place images in `frontend/public/` folder and reference as `/image.jpg`

### Issue: Contact form doesn't work
**Solution:** Implement one of the backend integration options above

### Issue: Styling issues
**Solution:** Check that Tailwind CSS is properly configured and run `npm install`

## 📞 Support

For any issues or questions:
- Check the documentation: `COMPANY_WEBSITE_GUIDE.md`
- Review existing code comments
- Test on localhost first before deploying

## 🎉 You're Ready!

Your WeddingWeb company website is ready to attract clients! 

**Visit `/company` to see your new professional company website!**

---

### Quick Commands

```bash
# Start development server
cd frontend && npm run dev

# Build for production
cd frontend && npm run build

# Deploy to Netlify
netlify deploy --prod

# Deploy to Vercel
vercel --prod
```

---

**Happy Building! 🚀💍**

