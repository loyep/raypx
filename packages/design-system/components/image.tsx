import { cn } from "@raypx/design-system/lib/utils";
import { Image as UnpicImage, type ImageProps as UnpicImageProps } from "@unpic/react";
import { cva, type VariantProps } from "class-variance-authority";

const imageVariants = cva("", {
  variants: {
    size: {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      full: "max-w-full",
    },
    shape: {
      square: "rounded-none",
      rounded: "rounded-md",
      circle: "rounded-full",
    },
  },
  defaultVariants: {
    size: "full",
    shape: "square",
  },
});

export type ImageProps = Omit<UnpicImageProps, "className" | "loading"> &
  VariantProps<typeof imageVariants> & {
    alt: string;
    className?: string;
    priority?: boolean;
  };

function Image({
  className,
  size,
  shape,
  layout,
  background,
  priority = false,
  alt,
  src,
  width,
  height,
  ...rest
}: ImageProps) {
  const imageProps: UnpicImageProps = {
    alt,
    src,
    width,
    height,
    background: background ?? "auto",
    className: cn(imageVariants({ size, shape }), className),
    layout: layout ?? "constrained",
    loading: priority ? "eager" : "lazy",
    ...rest,
  } as UnpicImageProps;

  return <UnpicImage data-slot="image" {...imageProps} />;
}

export { Image, imageVariants };
