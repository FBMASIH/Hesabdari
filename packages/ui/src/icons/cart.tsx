import { IconBase, type IconProps } from './icon-base';

/** Solar: Cart Large Linear — sales/invoices */
export function IconCart(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M2 3h2.5l1 3m0 0 2.5 9h9l3-9H5.5Z" />
      <circle cx="9.5" cy="19.5" r="1.5" />
      <circle cx="17.5" cy="19.5" r="1.5" />
    </IconBase>
  );
}
