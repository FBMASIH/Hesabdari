import { IconBase, type IconProps } from './icon-base';

export function IconAddCircle(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M15 12h-3m0 0H9m3 0V9m0 3v3" />
    </IconBase>
  );
}
