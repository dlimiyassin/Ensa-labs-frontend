export type AnimationPhase = 'enter' | 'leave' | 'emphasis';

export interface GlobalAnimationConfig {
  readonly name: GlobalAnimationName;
  readonly phase: AnimationPhase;
  readonly cssClass: string;
}

export const ENTER_ANIMATIONS = {
  fadeIn: 'anim-enter-fade-in',
  slideIn: 'anim-enter-slide-in',
  zoomIn: 'anim-enter-zoom-in',
  scaleIn: 'anim-enter-scale-in',
  bounceIn: 'anim-enter-bounce-in',
  flipIn: 'anim-enter-flip-in'
} as const;

export const LEAVE_ANIMATIONS = {
  fadeOut: 'anim-leave-fade-out',
  slideOut: 'anim-leave-slide-out',
  zoomOut: 'anim-leave-zoom-out',
  scaleOut: 'anim-leave-scale-out',
  collapse: 'anim-leave-collapse',
  flipOut: 'anim-leave-flip-out'
} as const;

export const EMPHASIS_ANIMATIONS = {
  shake: 'anim-emphasis-shake',
  pulse: 'anim-emphasis-pulse',
  wiggle: 'anim-emphasis-wiggle',
  bounce: 'anim-emphasis-bounce',
  flash: 'anim-emphasis-flash',
  glow: 'anim-emphasis-glow'
} as const;

export type EnterAnimationName = keyof typeof ENTER_ANIMATIONS;
export type LeaveAnimationName = keyof typeof LEAVE_ANIMATIONS;
export type EmphasisAnimationName = keyof typeof EMPHASIS_ANIMATIONS;

export type GlobalAnimationName =
  | EnterAnimationName
  | LeaveAnimationName
  | EmphasisAnimationName;

const GLOBAL_ANIMATION_CONFIGS: readonly GlobalAnimationConfig[] = [
  ...Object.entries(ENTER_ANIMATIONS).map(([name, cssClass]) => ({
    name: name as EnterAnimationName,
    phase: 'enter' as const,
    cssClass
  })),
  ...Object.entries(LEAVE_ANIMATIONS).map(([name, cssClass]) => ({
    name: name as LeaveAnimationName,
    phase: 'leave' as const,
    cssClass
  })),
  ...Object.entries(EMPHASIS_ANIMATIONS).map(([name, cssClass]) => ({
    name: name as EmphasisAnimationName,
    phase: 'emphasis' as const,
    cssClass
  }))
];

export const GLOBAL_ANIMATION_MAP: ReadonlyMap<GlobalAnimationName, GlobalAnimationConfig> =
  new Map(GLOBAL_ANIMATION_CONFIGS.map((config) => [config.name, config]));

export const DEFAULT_ANIMATION_DURATION_MS = 480;
export const DEFAULT_ANIMATION_DELAY_MS = 0;