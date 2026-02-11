// Framer Motion animation variants for consistent animations across the site

export const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
    }
  }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const
    }
  }
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
    }
  }
};

export const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
    }
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
    }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -8,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
    }
  }
};

export const tiltHover = {
  rest: { rotateX: 0, rotateY: 0 },
  hover: { 
    rotateX: -5, 
    rotateY: 5,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const
    }
  }
};

export const counterAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: custom * 0.1
    }
  })
};

export const textRotate = {
  initial: { opacity: 0, y: 20, rotateX: -90 },
  animate: { 
    opacity: 1, 
    y: 0, 
    rotateX: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    rotateX: 90,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
    }
  }
};

export const backgroundCrossfade = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: "easeInOut" as const
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 1.2,
      ease: "easeInOut" as const
    }
  }
};

// Gradient animation variants for Legend-style backgrounds
export const gradientFloat = {
  initial: { 
    x: 0, 
    y: 0,
    scale: 1,
    opacity: 0
  },
  animate: { 
    x: [0, 30, -20, 0],
    y: [0, -40, 30, 0],
    scale: [1, 1.2, 0.9, 1],
    opacity: [0, 1, 1, 0],
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
};

export const gradientPulse = {
  animate: {
    scale: [1, 1.3, 1],
    opacity: [0.1, 0.2, 0.1],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
};

export const blurTransition = {
  initial: { filter: 'blur(0px)' },
  animate: { 
    filter: ['blur(0px)', 'blur(40px)', 'blur(0px)'],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
};

export const floatingParticle = {
  animate: {
    y: [0, -100],
    opacity: [0, 0.3, 0],
    scale: [0.8, 1.2, 0.8],
    transition: {
      duration: 15,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
};
