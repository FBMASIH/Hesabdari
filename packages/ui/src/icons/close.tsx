import { IconBase, type IconProps } from './icon-base';

export function IconClose(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m18 6-12 12M6 6l12 12" />
    </IconBase>
  );
}
