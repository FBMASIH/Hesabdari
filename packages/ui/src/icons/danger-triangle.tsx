import { IconBase, type IconProps } from './icon-base';

export function IconDangerTriangle(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5.312 10.761C8.23 5.587 9.689 3 12 3c2.31 0 3.77 2.587 6.688 7.761l.364.645c2.425 4.3 3.638 6.45 2.542 8.022S17.786 21 12.935 21h-1.87c-4.852 0-7.277 0-8.38-1.572-1.101-1.572.113-3.723 2.543-8.022l.084-.145Z" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
    </IconBase>
  );
}
