import { IconBase, type IconProps } from './icon-base';

/** Solar: Trash Bin 2 Linear */
export function IconTrash(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </IconBase>
  );
}
