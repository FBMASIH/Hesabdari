import { IconBase, type IconProps } from './icon-base';

/** Solar: Forbidden Circle Linear — cancel/revoke */
export function IconBan(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m4.93 4.93 14.14 14.14" />
    </IconBase>
  );
}
