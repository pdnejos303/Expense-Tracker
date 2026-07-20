/**
 * Shared animation variants for framer-motion
 * Used across the app for consistent, purposeful motion
 */

// Easing curves
export const easeOutQuart = [0.25, 1, 0.5, 1];
export const easeOutExpo = [0.16, 1, 0.3, 1];

// Page entrance animation
export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOutQuart },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25, ease: easeOutQuart },
  },
};

// Fade in (simple)
export const fadeIn = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.4, ease: easeOutQuart },
  },
};

// Fade + slide up
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutQuart },
  },
};

// Fade + scale
export const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: easeOutQuart },
  },
};

// Stagger container - orchestrates children animations
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

// Stagger child variant
export const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOutQuart },
  },
};

// Card hover effect (for sx prop, not framer)
export const cardHoverSx = {
  transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
};

// Landing page scroll reveal
export const scrollReveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutQuart },
  },
  viewport: { once: true, margin: '-60px' },
};

// Number count up helper
export const counterTransition = {
  duration: 0.8,
  ease: easeOutQuart,
};
