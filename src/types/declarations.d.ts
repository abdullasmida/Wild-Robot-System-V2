// This file helps TypeScript understand our legacy JavaScript files
// It acts as a "Bridge" so the red lines disappear 🌉

declare module '*.jsx';
declare module '*.js';

// Specific overrides if needed
declare module '@/context/UserContext';
declare module '../../context/UserContext';
declare module '@/lib/utils';
