# CORS Toolkit

CORS Toolkit is an interactive developer utility built with React and Vite that helps developers understand, inspect, and troubleshoot Cross-Origin Resource Sharing (CORS) issues. It provides visual explanations, header inspection, framework-specific configuration guidance, and common debugging resources in a clean, responsive interface.

> **Note:** This project is intended as a learning and debugging utility. It does not modify server-side CORS policies or bypass browser security restrictions.

## Features

- Parse common CORS error messages
- Inspect request and response headers
- Visualize the CORS request flow
- Framework configuration reference
- Client-side troubleshooting checklist
- Shareable application state through URL
- Responsive and modern user interface
- Light and dark theme support

## Tech Stack

- React
- Vite
- JavaScript (ES6+)
- Framer Motion
- Lucide React
- CSS

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### Installation

```bash
git clone https://github.com/Zephyrex21/cors-toolkit.git
```

```bash
cd cors-toolkit
```

```bash
npm install
```

```bash
npm run dev
```

Open your browser and visit:

```
http://localhost:5173
```

## Project Structure

```
cors-toolkit
├── public
├── src
│   ├── components
│   ├── lib
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── README.md
```

## Future Improvements

- Server-side CORS testing
- API request playground
- Additional framework presets
- Export debugging reports
- Browser extension integration

## License

This project is licensed under the MIT License.