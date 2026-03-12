# 🍺 Beer Search Application

Modern, AI-powered craft beer discovery platform built with Vue 3 - search, save, and organize your favorite beers.

## ✨ Features

### 🔍 Smart Search
- **Single Beer Search**: Quick lookup by beer name
- **Batch Search**: Paste a list of beer names (one per line)
- **Image Search**: Upload a photo of a beer menu and extract all beer names automatically
- **Real-time Results**: Powered by Google Gemini AI with Untappd data

### 📊 Rich Beer Data
- Beer name, brewery, and style
- ABV (Alcohol by Volume)
- Community ratings (color-coded: green ≥4.0, amber ≥3.5, red <3.5)
- Number of check-ins
- Detailed descriptions

### 💾 User Features
- **Favorites**: Save your favorite beers for quick access
- **Custom Lists**: Create and manage themed beer lists
- **Add from Search**: Directly add beers to favorites or lists from search results
- **Search History**: Track your recent searches

### 🎨 Modern UI
- Clean, responsive design with Tailwind CSS
- Imageless beer cards for fast loading
- Color-coded ratings for visual feedback
- Smooth animations and transitions

## 🛠 Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite 4
- **State Management**: Pinia 2
- **Routing**: Vue Router 4
- **Styling**: Tailwind CSS 3
- **API Client**: Native Fetch API
- **Deployment**: Vercel

## 📦 Installation

### Prerequisites

- Node.js 18+
- Beer Search API server running

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd beer-search-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```
   
   For production:
   ```env
   VITE_API_BASE_URL=https://your-api-domain.vercel.app/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

## 🚀 Usage

### Search for Beers

1. **Navigate to Search page** (via menu or home CTA button)
2. **Choose your input method**:
   - 🍺 **Single Beer**: Enter one beer name
   - 📋 **List**: Paste multiple beer names (one per line)
   - 📷 **Image**: Upload a photo of a beer menu
3. **Click Search** and wait for AI-powered results
4. **View detailed information** in the results table

### Manage Results

Each beer in search results has action buttons:
- **♥ Favorite**: Toggle favorite status (heart icon)
- **+ List**: Add to an existing list via dropdown

### Organize Your Beers

- **Favorites**: Click the heart icon on any beer card or search result
- **Lists**: Create custom lists (e.g., "Want to Try", "Summer Favorites")
  - Navigate to Lists page
  - Create new list with name and description
  - Add beers from search results or beer cards

### View Popular Beers

The home page displays a curated selection of 12 popular craft beers with:
- Real-time ratings
- ABV information
- Quick favorite toggle
- Color-coded quality indicators

## 🎨 Color-Coded Ratings

Ratings use color psychology to indicate quality at a glance:
- 🟢 **Green** (≥4.0): Excellent beers
- 🟡 **Amber** (3.5-3.99): Good beers  
- 🔴 **Red** (<3.5): Average or below

## 📁 Project Structure

```
beer-search-frontend/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, styles
│   ├── components/      # Reusable Vue components
│   ├── router/          # Vue Router configuration
│   ├── stores/          # Pinia stores
│   │   ├── auth.js      # Authentication state
│   │   ├── beer.js      # Beer data & search
│   │   └── lists.js     # Lists & favorites
│   ├── services/        # API client
│   │   └── api.js       # API service layer
│   ├── views/           # Page components
│   │   ├── Home.vue     # Landing page
│   │   ├── Search.vue   # Search interface
│   │   ├── Lists.vue    # Lists management
│   │   ├── Login.vue    # Authentication
│   │   └── Register.vue
│   ├── App.vue          # Root component
│   └── main.js          # App entry point
├── index.html
└── package.json
```

## 🧪 Development

```bash
# Run development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🚢 Deployment

### Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set environment variables** in Vercel dashboard:
   - `VITE_API_BASE_URL` - Your API endpoint URL

Vercel will automatically detect the Vite project and configure the build.

### Build Output

The production build is optimized:
- Code splitting for faster initial load
- Tree-shaking to remove unused code
- Minified JavaScript and CSS
- Optimized assets

## 🔐 Authentication

The app supports user accounts with:
- Email/password registration
- Email verification via OTP
- JWT token-based sessions
- Automatic token refresh
- Secure logout

Not authenticated users can:
- Search for beers
- View popular beers
- Browse beer information

Authenticated users can additionally:
- Save favorite beers
- Create custom lists
- Add beers to lists
- Track search history

## 🎯 Key Pages

### Home (`/`)
- Hero section with search CTA
- 12 popular craft beers showcase
- Quick favorite toggle
- Direct navigation to Search page

### Search (`/search`)
- Multi-mode search interface
- Real-time AI processing
- Results table with all beer metadata
- Add to favorites/lists directly from results
- CSV export functionality

### Lists (`/lists`)
- View all custom lists
- Create/edit/delete lists
- Manage list visibility (public/private)
- View list items

### Favorites (`/favorites`)
- Your saved favorite beers
- Quick access to frequently viewed beers
- Remove from favorites

## 🌐 Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## 📱 Responsive Design

Fully responsive layout optimized for:
- 📱 Mobile (320px+)
- 📲 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1280px+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

MIT

---

**Author**: Breno Verdi  
**Version**: 0.1.0  
**Powered by**: Google Gemini AI + Untappd data
