import { IconBase, type IconProps } from './icon-base';

/** Solar: Box Linear — products/inventory */
export function IconBox(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 2 9 4.5v11L12 22l-9-4.5v-11L12 2Z" />
      <path d="M12 22V11" />
      <path d="m12 11 9-4.5" />
      <path d="m12 11-9-4.5" />
    </IconBase>
  );
}
