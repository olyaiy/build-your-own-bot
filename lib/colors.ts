// Define the structure of a color palette with all possible shades
export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

// Define the color scheme interface
export interface ColorScheme {
  id: string;
  name: string;
  description?: string;
  primary: ColorPalette | 'default';
  secondary?: ColorPalette;
  accent?: string;
}

// Persian Plum color palette
export const persianPlumPalette: ColorPalette = {
  50: '#fff1f2',
  100: '#ffe0e2',
  200: '#ffc6ca',
  300: '#ff9ea4',
  400: '#ff6771',
  500: '#fc3744',
  600: '#ea1826',
  700: '#c5101c',
  800: '#a3111b',
  900: '#6b1117',
  950: '#4a050a'
};

// Blue color palette
export const bluePalette: ColorPalette = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554'
};

// Define available color schemes
export const colorSchemes: ColorScheme[] = [
  {
    id: 'persian-plum',
    name: 'Persian Plum',
    description: 'A rich plum color palette for a bold, premium look',
    primary: persianPlumPalette,
  },
  {
    id: 'blue',
    name: 'Blue',
    description: 'Classic blue theme for a professional, trustworthy look',
    primary: bluePalette,
  },
  {
    id: 'default',
    name: 'Default',
    description: 'Default theme for a professional, trustworthy look',
    primary: 'default',
  },
];

// Get a color scheme by ID
export function getColorScheme(schemeId: string): ColorScheme | undefined {
  return colorSchemes.find(scheme => scheme.id === schemeId);
}

// Get default color scheme
export function getDefaultColorScheme(): ColorScheme {
  return colorSchemes.find(scheme => scheme.id === 'default') || colorSchemes[0];
}
