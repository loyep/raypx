export type { IconProps as TablerIconProps } from "@tabler/icons-react";
export { IconLoader2 as SpinnerIcon } from "@tabler/icons-react";

import type { IconProps as TablerIconProps } from "@tabler/icons-react";
import type { ComponentType } from "react";
import * as React from "react";

export type TablerIcon = ComponentType<TablerIconProps>;
export type TablerIconComponent = TablerIcon;

export type IconProps = TablerIconProps & {
  icon: TablerIcon;
};

export const Icon = (props: IconProps) => {
  if (!props.icon) return null;
  const { icon, ...rest } = props;
  return React.createElement(icon, rest);
};
