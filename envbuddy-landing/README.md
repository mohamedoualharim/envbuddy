# EnvBuddy Landing Page

A clean, modern landing page for EnvBuddy - the CLI tool for managing environment variables.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe development
- **Lucide Icons** - Beautiful icon set

## Features

- ✨ Clean, responsive design
- 🚀 Fast loading with Next.js optimizations
- 📱 Mobile-friendly
- 🎨 Modern UI with shadcn/ui components
- 🌗 Dark mode ready

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Page Sections

1. **Hero Section**
   - Eye-catching title and subtitle
   - Clear CTA to install the CLI

2. **How It Works**
   - 3-step process visualization
   - Login → Create Project → Push/Pull

3. **Benefits Section**
   - Three key value propositions
   - Visual cards with icons

4. **Features List**
   - Technical features with checkmarks
   - Grid layout for easy scanning

5. **Footer**
   - Social links (GitHub, Twitter, Email)
   - Clean, minimal design

## Customization

### Update Links
- Replace GitHub links with your repository URL
- Update Twitter handle in footer
- Change email address in footer

### Colors
The site uses shadcn/ui's default neutral theme. You can customize colors in `app/globals.css`.

### Content
All content is in `app/page.tsx`. Update text, features, and benefits as needed.

## Deployment

Deploy easily on Vercel:

```bash
npx vercel
```

Or build and deploy to any static hosting service.

## License

MIT
