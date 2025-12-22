
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register the ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const animateWithGsap = (target: string | Element | Element[], animationProps: gsap.TweenVars, scrollProps?: any) => {
  gsap.to(target, {
    ...animationProps,
    scrollTrigger: {
      trigger: target as any,
      toggleActions: 'restart reverse restart reverse',
      start: 'top 95%',
      ...scrollProps,
    }
  });
};

export const animateWithGsapTimeline = (
  timeline: gsap.core.Timeline, 
  rotationRef: { current: { rotation: { y: number } } }, 
  rotationState: number, 
  firstTarget: string | Element, 
  secondTarget: string | Element, 
  animationProps: gsap.TweenVars
) => {
  timeline.to(rotationRef.current.rotation, {
    y: rotationState,
    duration: 1,
    ease: 'power2.inOut'
  });

  timeline.to(
    firstTarget,
    {
      ...animationProps,
      ease: 'power2.inOut'
    },
    '<'
  );

  timeline.to(
    secondTarget,
    {
      ...animationProps,
      ease: 'power2.inOut'
    },
    '<'
  );
};
