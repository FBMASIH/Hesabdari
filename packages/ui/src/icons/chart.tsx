import { IconBase, type IconProps } from './icon-base';

export function IconChart(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M22 22H2" />
      <path d="M21 22V14.5a1.5 1.5 0 0 0-1.5-1.5h-3a1.5 1.5 0 0 0-1.5 1.5V22" />
      <path d="M15 22V5c0-1.414 0-2.121-.44-2.56C14.122 2 13.415 2 12 2c-1.414 0-2.121 0-2.56.44C9 2.878 9 3.585 9 5v17" />
      <path d="M9 22v-8.5A1.5 1.5 0 0 0 7.5 12h-3A1.5 1.5 0 0 0 3 13.5V22" />
    </IconBase>
  );
}
