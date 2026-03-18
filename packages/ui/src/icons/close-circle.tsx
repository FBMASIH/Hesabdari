import { IconBase, type IconProps } from './icon-base';

export function IconCloseCircle(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m14.5 9.5-5 5m0-5 5 5" />
    </IconBase>
  );
}
