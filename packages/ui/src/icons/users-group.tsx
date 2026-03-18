import { IconBase, type IconProps } from './icon-base';

export function IconUsersGroup(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="6" r="4" />
      <path d="M14 20.834c-.634.108-1.305.166-2 .166-3.866 0-7-1.79-7-4s3.134-4 7-4c1.713 0 3.283.352 4.5.936" />
      <circle cx="18" cy="9" r="3" />
      <path d="M21 16.5c0 1.141-1.246 2.115-3 2.5" />
    </IconBase>
  );
}
