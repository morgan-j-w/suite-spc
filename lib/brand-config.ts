// Brand configuration - Edit these values to customize your preference centre
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

export const colorThemes: Record<ColorTheme, { name: string; description: string }> = {
  blue: { name: 'Client theme 1', description: 'Trust-building blue tones' },
  green: { name: 'Client theme 2', description: 'Fresh, eco-friendly greens' },
  orange: { name: 'Client theme 3', description: 'Warm, inviting orange tones' },
  purple: { name: 'Client theme 4', description: 'Bold, creative purple' },
  neutral: { name: 'Client theme 5', description: 'Clean grays and blacks' },
  coastal: { name: 'Client theme 6', description: 'Ocean blues with marigold accents' },
}

// Default theme - change this to set the default color scheme
export const defaultTheme: ColorTheme = 'blue'
