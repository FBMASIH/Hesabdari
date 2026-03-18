import { IconBase, type IconProps } from './icon-base';

/** Solar: Scale Linear — trial balance / accounting balance */
export function IconScale(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3v18" />
      <path d="M3 8l4.5 7h9L21 8" />
      <circle cx="7.5" cy="15" r="2.5" />
      <circle cx="16.5" cy="15" r="2.5" />
      <path d="M7 3h10" />
    </IconBase>
  );
}
