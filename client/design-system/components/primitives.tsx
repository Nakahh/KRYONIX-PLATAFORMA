import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { colors, spacing, borderRadius, shadows, typography } from '../tokens';

// =============================================================================
// BOX - Componente base para layout
// =============================================================================

const boxVariants = cva(
  '',
  {
    variants: {
      p: {
        0: 'p-0',
        1: 'p-1',
        2: 'p-2',
        3: 'p-3',
        4: 'p-4',
        5: 'p-5',
        6: 'p-6',
        8: 'p-8',
        10: 'p-10',
        12: 'p-12',
        16: 'p-16',
        20: 'p-20',
        24: 'p-24',
      },
      m: {
        0: 'm-0',
        1: 'm-1',
        2: 'm-2',
        3: 'm-3',
        4: 'm-4',
        5: 'm-5',
        6: 'm-6',
        8: 'm-8',
        10: 'm-10',
        12: 'm-12',
        16: 'm-16',
        20: 'm-20',
        24: 'm-24',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        base: 'rounded',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full',
      },
      shadow: {
        none: 'shadow-none',
        sm: 'shadow-sm',
        base: 'shadow',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
        '2xl': 'shadow-2xl',
        inner: 'shadow-inner',
      },
      bg: {
        transparent: 'bg-transparent',
        white: 'bg-white',
        gray: 'bg-gray-100',
        primary: 'bg-blue-500',
        secondary: 'bg-purple-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
        gradient: 'bg-gradient-to-r from-blue-500 to-purple-500',
      },
    },
    defaultVariants: {
      p: 0,
      m: 0,
      rounded: 'none',
      shadow: 'none',
      bg: 'transparent',
    },
  }
);

export interface BoxProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof boxVariants> {
  as?: React.ElementType;
}

export const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ className, as: Component = 'div', p, m, rounded, shadow, bg, ...props }, ref) => {
    return (
      <Component
        className={cn(boxVariants({ p, m, rounded, shadow, bg }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Box.displayName = 'Box';

// =============================================================================
// STACK - Layout vertical com espaçamento
// =============================================================================

const stackVariants = cva(
  'flex flex-col',
  {
    variants: {
      spacing: {
        0: 'space-y-0',
        1: 'space-y-1',
        2: 'space-y-2',
        3: 'space-y-3',
        4: 'space-y-4',
        5: 'space-y-5',
        6: 'space-y-6',
        8: 'space-y-8',
        10: 'space-y-10',
        12: 'space-y-12',
        16: 'space-y-16',
        20: 'space-y-20',
        24: 'space-y-24',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      },
    },
    defaultVariants: {
      spacing: 4,
      align: 'stretch',
      justify: 'start',
    },
  }
);

export interface StackProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ className, spacing, align, justify, ...props }, ref) => {
    return (
      <div
        className={cn(stackVariants({ spacing, align, justify }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Stack.displayName = 'Stack';

// =============================================================================
// GROUP - Layout horizontal com espaçamento
// =============================================================================

const groupVariants = cva(
  'flex flex-row',
  {
    variants: {
      spacing: {
        0: 'space-x-0',
        1: 'space-x-1',
        2: 'space-x-2',
        3: 'space-x-3',
        4: 'space-x-4',
        5: 'space-x-5',
        6: 'space-x-6',
        8: 'space-x-8',
        10: 'space-x-10',
        12: 'space-x-12',
        16: 'space-x-16',
        20: 'space-x-20',
        24: 'space-x-24',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
        baseline: 'items-baseline',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      },
      wrap: {
        nowrap: 'flex-nowrap',
        wrap: 'flex-wrap',
        'wrap-reverse': 'flex-wrap-reverse',
      },
    },
    defaultVariants: {
      spacing: 4,
      align: 'center',
      justify: 'start',
      wrap: 'nowrap',
    },
  }
);

export interface GroupProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof groupVariants> {}

export const Group = forwardRef<HTMLDivElement, GroupProps>(
  ({ className, spacing, align, justify, wrap, ...props }, ref) => {
    return (
      <div
        className={cn(groupVariants({ spacing, align, justify, wrap }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Group.displayName = 'Group';

// =============================================================================
// GRID - Layout em grid responsivo
// =============================================================================

const gridVariants = cva(
  'grid',
  {
    variants: {
      cols: {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
        12: 'grid-cols-12',
        auto: 'grid-cols-auto',
        'auto-fit': 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',
        'auto-fill': 'grid-cols-[repeat(auto-fill,minmax(250px,1fr))]',
      },
      gap: {
        0: 'gap-0',
        1: 'gap-1',
        2: 'gap-2',
        3: 'gap-3',
        4: 'gap-4',
        5: 'gap-5',
        6: 'gap-6',
        8: 'gap-8',
        10: 'gap-10',
        12: 'gap-12',
        16: 'gap-16',
        20: 'gap-20',
        24: 'gap-24',
      },
      responsive: {
        true: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        false: '',
      },
    },
    defaultVariants: {
      cols: 'auto-fit',
      gap: 4,
      responsive: false,
    },
  }
);

export interface GridProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols, gap, responsive, ...props }, ref) => {
    return (
      <div
        className={cn(gridVariants({ cols, gap, responsive }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Grid.displayName = 'Grid';

// =============================================================================
// TEXT - Componente de texto com variantes
// =============================================================================

const textVariants = cva(
  '',
  {
    variants: {
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl',
        '5xl': 'text-5xl',
        '6xl': 'text-6xl',
        '7xl': 'text-7xl',
        '8xl': 'text-8xl',
        '9xl': 'text-9xl',
      },
      weight: {
        thin: 'font-thin',
        extralight: 'font-extralight',
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
        extrabold: 'font-extrabold',
        black: 'font-black',
      },
      color: {
        inherit: 'text-inherit',
        current: 'text-current',
        primary: 'text-blue-600',
        secondary: 'text-purple-600',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        error: 'text-red-600',
        muted: 'text-gray-500',
        'muted-foreground': 'text-gray-600',
        foreground: 'text-gray-900',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify',
      },
      transform: {
        none: 'normal-case',
        uppercase: 'uppercase',
        lowercase: 'lowercase',
        capitalize: 'capitalize',
      },
      decoration: {
        none: 'no-underline',
        underline: 'underline',
        'line-through': 'line-through',
      },
      truncate: {
        true: 'truncate',
        false: '',
      },
      gradient: {
        true: 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
        false: '',
      },
    },
    defaultVariants: {
      size: 'base',
      weight: 'normal',
      color: 'foreground',
      align: 'left',
      transform: 'none',
      decoration: 'none',
      truncate: false,
      gradient: false,
    },
  }
);

export interface TextProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'strong' | 'em' | 'small';
}

export const Text = forwardRef<HTMLElement, TextProps>(
  ({ 
    className, 
    as: Component = 'p', 
    size, 
    weight, 
    color, 
    align, 
    transform, 
    decoration, 
    truncate, 
    gradient,
    ...props 
  }, ref) => {
    return (
      <Component
        className={cn(
          textVariants({ 
            size, 
            weight, 
            color, 
            align, 
            transform, 
            decoration, 
            truncate, 
            gradient 
          }), 
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Text.displayName = 'Text';

// =============================================================================
// HEADING - Componente específico para títulos
// =============================================================================

const headingVariants = cva(
  'font-semibold tracking-tight',
  {
    variants: {
      level: {
        1: 'text-4xl lg:text-5xl',
        2: 'text-3xl lg:text-4xl',
        3: 'text-2xl lg:text-3xl',
        4: 'text-xl lg:text-2xl',
        5: 'text-lg lg:text-xl',
        6: 'text-base lg:text-lg',
      },
      color: {
        inherit: 'text-inherit',
        primary: 'text-gray-900',
        secondary: 'text-gray-700',
        muted: 'text-gray-600',
        gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
      },
    },
    defaultVariants: {
      level: 1,
      color: 'primary',
    },
  }
);

export interface HeadingProps 
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 1, color, children, ...props }, ref) => {
    const Component = `h${level}` as const;
    
    return (
      <Component
        className={cn(headingVariants({ level, color }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Heading.displayName = 'Heading';

// =============================================================================
// DIVIDER - Separador visual
// =============================================================================

const dividerVariants = cva(
  'border-gray-200',
  {
    variants: {
      orientation: {
        horizontal: 'w-full border-t',
        vertical: 'h-full border-l',
      },
      variant: {
        solid: 'border-solid',
        dashed: 'border-dashed',
        dotted: 'border-dotted',
      },
      size: {
        1: 'border-t-[1px]',
        2: 'border-t-2',
        4: 'border-t-4',
        8: 'border-t-8',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      variant: 'solid',
      size: 1,
    },
  }
);

export interface DividerProps 
  extends React.HTMLAttributes<HTMLHRElement>,
    VariantProps<typeof dividerVariants> {}

export const Divider = forwardRef<HTMLHRElement, DividerProps>(
  ({ className, orientation, variant, size, ...props }, ref) => {
    return (
      <hr
        className={cn(dividerVariants({ orientation, variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Divider.displayName = 'Divider';

// =============================================================================
// CONTAINER - Wrapper com max-width responsivo
// =============================================================================

const containerVariants = cva(
  'mx-auto px-4 sm:px-6 lg:px-8',
  {
    variants: {
      size: {
        sm: 'max-w-2xl',
        md: 'max-w-4xl',
        lg: 'max-w-6xl',
        xl: 'max-w-7xl',
        full: 'max-w-none',
      },
      center: {
        true: 'mx-auto',
        false: '',
      },
    },
    defaultVariants: {
      size: 'lg',
      center: true,
    },
  }
);

export interface ContainerProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, center, ...props }, ref) => {
    return (
      <div
        className={cn(containerVariants({ size, center }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Container.displayName = 'Container';

// =============================================================================
// SECTION - Seção de página com espaçamento padrão
// =============================================================================

const sectionVariants = cva(
  'w-full',
  {
    variants: {
      spacing: {
        none: '',
        sm: 'py-8 lg:py-12',
        md: 'py-12 lg:py-16',
        lg: 'py-16 lg:py-20',
        xl: 'py-20 lg:py-24',
      },
      background: {
        transparent: 'bg-transparent',
        white: 'bg-white',
        gray: 'bg-gray-50',
        primary: 'bg-blue-50',
        secondary: 'bg-purple-50',
        gradient: 'bg-gradient-to-r from-blue-50 to-purple-50',
      },
    },
    defaultVariants: {
      spacing: 'md',
      background: 'transparent',
    },
  }
);

export interface SectionProps 
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing, background, ...props }, ref) => {
    return (
      <section
        className={cn(sectionVariants({ spacing, background }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Section.displayName = 'Section';
