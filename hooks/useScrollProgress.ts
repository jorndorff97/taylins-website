"use client";

import { useEffect, useState } from "react";
import { useScroll, useTransform, MotionValue } from "framer-motion";

export function useScrollProgress() {
  const { scrollYProgress } = useScroll();
  return scrollYProgress;
}

export function useParallax(distance: number = 50): MotionValue<number> {
  const { scrollY } = useScroll();
  return useTransform(scrollY, [0, 1000], [0, distance]);
}

export function useScrollTrigger(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest > threshold && !isVisible) {
        setIsVisible(true);
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress, threshold, isVisible]);

  return isVisible;
}

export function useInView() {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(ref);

    return () => {
      if (ref) observer.unobserve(ref);
    };
  }, [ref]);

  return [setRef, isInView] as const;
}
