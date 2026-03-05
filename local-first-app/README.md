# Local-First App

A local-first app project study exploring offline-first architecture patterns with React and IndexedDB.

## About

This project demonstrates local-first principles by persisting application state directly in the browser using IndexedDB. Data is stored locally first, enabling the app to work offline and providing instant responsiveness without network latency.

## Tech Stack

- React 19
- TypeScript
- Vite
- IndexedDB (via custom hook)

## Key Features

- **Persistent State**: Application state survives page refreshes and browser restarts
- **Offline Support**: Works without an internet connection
- **Custom `useIndexedDB` Hook**: A React hook that mirrors `useState` but persists data to IndexedDB

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── hooks/
│   └── useIndexedDB.ts   # Custom hook for IndexedDB persistence
├── App.tsx               # Main application component
├── main.tsx              # Entry point
└── ...
```

## How It Works

The `useIndexedDB` hook provides a `useState`-like API that automatically persists values to IndexedDB:

```tsx
const [count, setCount] = useIndexedDB("count", 0);
```

On initial render, it hydrates state from IndexedDB if a stored value exists. All subsequent state updates are automatically persisted.
