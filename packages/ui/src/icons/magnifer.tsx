import { IconBase, type IconProps } from './icon-base';

export function IconMagnifer(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11.5" cy="11.5" r="9.5" />
      <path d="M18.5 18.5 22 22" />
    </IconBase>
  );
}
