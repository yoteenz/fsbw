# Build A Wig

A standalone React application for building custom wigs with 9 customization steps.

## Features

- Main build-a-wig page
- 9 sub-pages for customization:
  - Length selection
  - Color selection
  - Density selection
  - Lace selection
  - Texture selection
  - Hairline selection
  - Cap size selection
  - Styling selection
  - Add-ons selection

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3001`

### Build

```bash
npm run build
```

### Deploy to Vercel

This project is configured for Vercel deployment. Simply:

1. Create a new Git repository
2. Push this folder to the repository
3. Import the repository in Vercel
4. Deploy!

The `vercel.json` file is already configured for optimal deployment.

## Project Structure

```
build-a-wig/
├── public/
│   └── assets/                   # All images, icons, and assets
│       ├── natural front.png     # Wig view images
│       ├── peak front.png
│       ├── lagos front.png
│       ├── cap size-icon.svg    # Customization icons
│       ├── back length-icon.svg
│       ├── density-icon.svg
│       ├── lace-icon.svg
│       ├── Texture-icon.svg
│       ├── Natural Hairline-icon.svg
│       ├── Lagos Hairline-icon.svg
│       ├── Peak Hairline-icon.svg
│       ├── Marble Floor.jpg     # Background images
│       ├── leaf-brick.png
│       ├── NOIR/                 # NOIR product assets
│       └── ... (120+ asset files)
├── src/
│   ├── pages/
│   │   └── build-a-wig/
│   │       ├── page.tsx          # Main page
│   │       ├── length/
│   │       ├── color/
│   │       ├── density/
│   │       ├── lace/
│   │       ├── texture/
│   │       ├── hairline/
│   │       ├── cap-size/
│   │       ├── styling/
│   │       └── addons/
│   ├── App.tsx                   # Router setup
│   └── main.tsx                  # Entry point
├── package.json
├── vite.config.ts
├── vercel.json
└── README.md
```

## Assets Included

All necessary assets have been included in the `public/assets/` folder:
- **Wig view images**: natural, peak, and lagos views (left, front, right)
- **Customization icons**: All 9 customization step icons
- **Background images**: Marble Floor, leaf-brick patterns
- **UI elements**: Buttons, icons, social media icons
- **NOIR assets**: Complete NOIR product image set
- **Fonts**: Futura PT and Bohemy font files
- **Total**: 120+ asset files

## Technologies

- React 19
- React Router DOM 6
- Vite
- TypeScript
- Tailwind CSS

