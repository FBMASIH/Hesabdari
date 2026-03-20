import { IconBase, type IconProps } from './icon-base';

/** Solar: Tuning 2 Linear — clean settings/preferences icon */
export function IconSettings(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 8h4m14 0h-8" />
      <path d="M3 16h8m8 0h-4" />
      <circle cx="10" cy="8" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="2.5" fill="currentColor" stroke="none" />
    </IconBase>
  );
}
