import React, { useState, useRef, useEffect, forwardRef } from "react";
import { cn } from "@/lib/utils";
import {
  generateOptimizedImageUrl,
  generateSrcSet,
  generateSizes,
  generateBlurPlaceholder,
  useOptimizedImage,
  ImagePerformanceMonitor,
  OPTIMIZATION_PRESETS,
  type OptimizedImageProps,
} from "@/lib/image-optimization";

// Componente de imagem otimizada para KRYONIX
export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  (
    {
      src,
      alt,
      className,
      width,
      height,
      quality = 80,
      format = "auto",
      fit = "cover",
      lazy = true,
      priority = false,
      placeholder = "blur",
      sizes,
      onClick,
      onLoad,
      onError,
      ...options
    },
    ref,
  ) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isError, setIsError] = useState(false);
    const [loadStartTime, setLoadStartTime] = useState<number>(0);
    const imgRef = useRef<HTMLImageElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Hook de otimização personalizada
    const optimizedImage = useOptimizedImage(src, {
      width,
      height,
      quality,
      format,
      fit,
      ...options,
    });

    // Lazy loading com Intersection Observer
    useEffect(() => {
      if (!lazy || priority) return;

      const currentImg = imgRef.current;
      if (!currentImg) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Começar carregamento quando entrar na viewport
              setLoadStartTime(performance.now());
              currentImg.src = optimizedImage.src;
              observerRef.current?.unobserve(currentImg);
            }
          });
        },
        {
          rootMargin: "50px", // Carregar 50px antes de aparecer
          threshold: 0.1,
        },
      );

      observerRef.current.observe(currentImg);

      return () => {
        observerRef.current?.disconnect();
      };
    }, [lazy, priority, optimizedImage.src]);

    // Handlers de eventos
    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
      const loadTime = performance.now() - loadStartTime;
      const img = event.currentTarget;

      setIsLoaded(true);

      // Registrar métricas de performance
      ImagePerformanceMonitor.recordImageLoad({
        src,
        loadTime,
        size: img.naturalWidth * img.naturalHeight,
        format: format === "auto" ? "webp" : format,
        fromCache: optimizedImage.isLoaded,
      });

      onLoad?.(event);
    };

    const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
      setIsError(true);
      onError?.(event);
    };

    // Gerar srcset e sizes
    const srcSet = !isError
      ? generateSrcSet(src, {
          quality,
          format,
          fit,
          ...options,
        })
      : undefined;

    const sizesAttr = sizes || generateSizes();

    // Classes condicionais
    const imageClasses = cn(
      "transition-all duration-300",
      {
        "opacity-0 scale-105": !isLoaded && !isError && placeholder !== "empty",
        "opacity-100 scale-100": isLoaded,
        "blur-sm": !isLoaded && placeholder === "blur",
        "animate-pulse bg-gray-200": !isLoaded && placeholder === "empty",
        grayscale: isError,
      },
      className,
    );

    // Placeholder enquanto carrega
    const PlaceholderElement = () => {
      if (placeholder === "empty") {
        return (
          <div
            className={cn(
              "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200",
              "bg-[length:200%_100%]",
              className,
            )}
            style={{ width, height }}
          />
        );
      }

      if (placeholder === "blur") {
        return (
          <img
            src={optimizedImage.placeholder}
            alt=""
            className={cn(
              "absolute inset-0 w-full h-full object-cover blur-sm scale-110",
              "transition-opacity duration-300",
              isLoaded ? "opacity-0" : "opacity-100",
            )}
            style={{ filter: "blur(8px)" }}
          />
        );
      }

      if (
        typeof placeholder === "string" &&
        placeholder !== "blur" &&
        placeholder !== "empty"
      ) {
        return (
          <img
            src={placeholder}
            alt=""
            className={cn(
              "absolute inset-0 w-full h-full object-cover",
              "transition-opacity duration-300",
              isLoaded ? "opacity-0" : "opacity-100",
            )}
          />
        );
      }

      return null;
    };

    // Error fallback
    if (isError) {
      return (
        <div
          className={cn(
            "flex items-center justify-center bg-gray-100 text-gray-400",
            "border border-gray-200 rounded",
            className,
          )}
          style={{ width, height }}
        >
          <div className="text-center">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs">Erro ao carregar</span>
          </div>
        </div>
      );
    }

    return (
      <div className="relative overflow-hidden">
        {/* Placeholder */}
        <PlaceholderElement />

        {/* Imagem principal */}
        <img
          ref={(node) => {
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            imgRef.current = node;
          }}
          src={priority || !lazy ? optimizedImage.src : undefined}
          srcSet={srcSet}
          sizes={sizesAttr}
          alt={alt}
          width={width}
          height={height}
          className={imageClasses}
          loading={lazy && !priority ? "lazy" : "eager"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          onClick={onClick}
          style={{
            aspectRatio: width && height ? `${width}/${height}` : undefined,
          }}
        />

        {/* Loading indicator */}
        {!isLoaded && !isError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  },
);

OptimizedImage.displayName = "OptimizedImage";

// Componente especializado para avatares
export const OptimizedAvatar = forwardRef<
  HTMLImageElement,
  OptimizedImageProps
>(({ className, ...props }, ref) => (
  <OptimizedImage
    ref={ref}
    {...OPTIMIZATION_PRESETS.avatar}
    {...props}
    className={cn("rounded-full", className)}
  />
));

OptimizedAvatar.displayName = "OptimizedAvatar";

// Componente especializado para thumbnails
export const OptimizedThumbnail = forwardRef<
  HTMLImageElement,
  OptimizedImageProps
>(({ className, ...props }, ref) => (
  <OptimizedImage
    ref={ref}
    {...OPTIMIZATION_PRESETS.thumbnail}
    {...props}
    className={cn("rounded-lg", className)}
  />
));

OptimizedThumbnail.displayName = "OptimizedThumbnail";

// Componente especializado para hero images
export const OptimizedHero = forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({ className, ...props }, ref) => (
    <OptimizedImage
      ref={ref}
      {...OPTIMIZATION_PRESETS.hero}
      {...props}
      className={cn("w-full", className)}
    />
  ),
);

OptimizedHero.displayName = "OptimizedHero";

// Componente especializado para ícones
export const OptimizedIcon = forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({ className, ...props }, ref) => (
    <OptimizedImage
      ref={ref}
      {...OPTIMIZATION_PRESETS.icon}
      {...props}
      className={cn("w-auto h-auto", className)}
    />
  ),
);

OptimizedIcon.displayName = "OptimizedIcon";

// Gallery component com lazy loading otimizado
interface OptimizedGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  columns?: number;
  gap?: number;
  className?: string;
  onImageClick?: (index: number) => void;
}

export const OptimizedGallery: React.FC<OptimizedGalleryProps> = ({
  images,
  columns = 3,
  gap = 4,
  className,
  onImageClick,
}) => {
  return (
    <div
      className={cn(
        "grid gap-4",
        {
          "grid-cols-1": columns === 1,
          "grid-cols-2": columns === 2,
          "grid-cols-3": columns === 3,
          "grid-cols-4": columns === 4,
          "grid-cols-5": columns === 5,
          "grid-cols-6": columns === 6,
        },
        className,
      )}
      style={{ gap: `${gap * 0.25}rem` }}
    >
      {images.map((image, index) => (
        <div
          key={index}
          className="relative group cursor-pointer"
          onClick={() => onImageClick?.(index)}
        >
          <OptimizedThumbnail
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />

          {image.caption && (
            <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              {image.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Hook para pré-carregar imagens importantes
export function useImagePreloader(urls: string[]) {
  const [preloadedCount, setPreloadedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (urls.length === 0) {
      setIsComplete(true);
      return;
    }

    let loadedCount = 0;

    const preloadImage = (url: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          setPreloadedCount(loadedCount);
          resolve();
        };
        img.onerror = () => {
          loadedCount++;
          setPreloadedCount(loadedCount);
          resolve();
        };
        img.src = generateOptimizedImageUrl(url, OPTIMIZATION_PRESETS.mobile);
      });
    };

    Promise.all(urls.map(preloadImage)).then(() => {
      setIsComplete(true);
    });
  }, [urls]);

  return {
    preloadedCount,
    totalCount: urls.length,
    progress: urls.length > 0 ? preloadedCount / urls.length : 1,
    isComplete,
  };
}

export default OptimizedImage;
