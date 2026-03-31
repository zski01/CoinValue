import '@testing-library/jest-dom';

// Polyfill for TextEncoder / TextDecoder (required by React Router 7)
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;