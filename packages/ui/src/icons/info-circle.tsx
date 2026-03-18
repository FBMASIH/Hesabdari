import { IconBase, type IconProps } from './icon-base';

export function IconInfoCircle(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 17v-6" />
      <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
    </IconBase>
  );
}
