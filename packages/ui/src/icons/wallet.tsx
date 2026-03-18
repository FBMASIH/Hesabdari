import { IconBase, type IconProps } from './icon-base';

/** Solar: Wallet Linear — cash flow */
export function IconWallet(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M21 12v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4Z" />
      <path d="M3 10h18" />
      <circle cx="16" cy="14" r="1" />
      <path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
    </IconBase>
  );
}
