// Brand configuration - Edit these values to customise your preference centre
export const brandConfig = {
  // Brand identity
  name: 'Acme Inc',
  tagline: 'Your trusted partner',
  logo: null as string | null, // Set to a path like '/logo.png' to use a custom logo

  // Contact information
  website: 'https://example.com',
  supportEmail: 'support@example.com',
  address: '123 Main Street, City, Country',

  // Social links (set to null to hide)
  social: {
    twitter: 'https://twitter.com/example',
    linkedin: 'https://linkedin.com/company/example',
    facebook: null as string | null,
    instagram: null as string | null,
  },

  // Footer links
  footerLinks: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Contact Us', href: '/contact' },
  ],

  // Copyright
  copyrightYear: new Date().getFullYear(),
}

// Color theme configuration
export type ColorTheme = 'blue' | 'green' | 'orange' | 'purple' | 'neutral' | 'coastal'

export const colorThemes: Record<ColorTheme, { name: string }> = {
  blue:    { name: 'Client theme 1' },
  green:   { name: 'Client theme 2' },
  orange:  { name: 'Client theme 3' },
  purple:  { name: 'Client theme 4' },
  neutral: { name: 'Client theme 5' },
  coastal: { name: 'Client theme 6' },
}

// Default theme - change this to set the default color scheme
export const defaultTheme: ColorTheme = 'blue'
