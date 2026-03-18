import { IconBase, type IconProps } from './icon-base';

/** Solar: Notebook Linear — journal / daily record */
export function IconNotebook(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
      <path d="M8 2v20" />
      <path d="M12 7h4M12 11h4M12 15h2" />
    </IconBase>
  );
}
