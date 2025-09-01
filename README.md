# ReLab Digital CMA

A modern Vue 3 web application for viewing and managing Comparative Market Analysis (CMA) reports. Built with Vite for fast development and optimized production builds.

## 🚀 Features

- **Vue 3 Composition API** - Modern reactive programming with `<script setup>`
- **Vue Router 4** - Client-side routing for seamless navigation
- **CMA Preview** - View saved CMA reports in readonly mode
- **Responsive Design** - Works perfectly on desktop and mobile devices
- **Fast Development** - Powered by Vite for lightning-fast hot reload
- **Production Ready** - Optimized builds with code splitting and minification

## 📋 Pages

- **Home** (`/`) - Welcome page with feature overview
- **About** (`/about`) - Information about ReLab Digital CMA
- **CMA Preview** (`/cma-preview`) - View CMA reports in readonly mode

## 🛠️ Tech Stack

- **Frontend Framework:** Vue 3 with Composition API
- **Build Tool:** Vite
- **Routing:** Vue Router 4
- **Styling:** CSS with scoped components
- **Package Manager:** npm

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd relab-digital-cma
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
relab-digital-cma/
├── public/                 # Static assets
│   ├── CMA/               # CMA-related files
│   ├── GeoJSON/           # Geographic data
│   ├── Home/              # Home page assets
│   └── ...
├── src/
│   ├── assets/            # Vue assets
│   ├── components/        # Vue components
│   ├── router/            # Vue Router configuration
│   ├── views/             # Page components
│   │   ├── Home.vue       # Home page
│   │   ├── About.vue      # About page
│   │   └── CMAPreview.vue # CMA preview page
│   ├── App.vue            # Root component
│   └── main.js            # Application entry point
├── .gitignore             # Git ignore rules
├── package.json           # Project dependencies
├── vite.config.js         # Vite configuration
└── README.md              # Project documentation
```

## 🎨 Development

### Code Style

This project uses Vue 3's Composition API with `<script setup>` syntax for better TypeScript support and cleaner code organization.

### Component Structure

- Use scoped CSS for component-specific styles
- Follow Vue 3 Composition API patterns
- Keep components small and focused on single responsibilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is private and proprietary to ReLab Digital CMA.

## 📞 Support

For support or questions, please contact the development team.

---

Built with ❤️ using Vue 3 and Vite
