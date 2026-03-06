import type { IconProps as TablerIconProps } from "@tabler/icons-react";
import type { ComponentType } from "react";
import * as React from "react";

export type TablerIconComponent = ComponentType<TablerIconProps>;

export type TablerIconRendererProps = TablerIconProps & {
  icon: TablerIconComponent;
};

export const TablerIcon = (props: TablerIconRendererProps) => {
  if (!props.icon) return null;
  const { icon, ...rest } = props;
  return React.createElement(icon, rest);
};
