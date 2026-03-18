import { IconBase, type IconProps } from './icon-base';

export function IconTransfer(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20 10H4l5.5-6" />
      <path d="M4 14h16l-5.5 6" />
    </IconBase>
  );
}
