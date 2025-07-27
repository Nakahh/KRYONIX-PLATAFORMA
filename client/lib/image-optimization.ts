// Sistema de otimização de imagens para KRYONIX
// Otimizado para dispositivos brasileiros e conexões móveis

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpg" | "png" | "auto";
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  background?: string;
  blur?: number;
  sharpen?: boolean;
  grayscale?: boolean;
  lazy?: boolean;
  priority?: boolean;
  placeholder?: "blur" | "empty" | string;
  sizes?: string;
  devicePixelRatio?: number;
}

export interface OptimizedImageProps extends ImageOptimizationOptions {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
}

// Configurações otimizadas para diferentes cenários brasileiros
export const OPTIMIZATION_PRESETS = {
  // Mobile 3G/4G - qualidade reduzida para velocidade
  mobile: {
    quality: 75,
    format: "webp" as const,
    width: 400,
    lazy: true,
    placeholder: "blur" as const,
  },

  // Tablet - qualidade média
  tablet: {
    quality: 80,
    format: "webp" as const,
    width: 768,
    lazy: true,
  },

  // Desktop - qualidade alta
  desktop: {
    quality: 85,
    format: "webp" as const,
    width: 1200,
    lazy: true,
  },

  // Avatar/perfil - pequeno e rápido
  avatar: {
    quality: 80,
    format: "webp" as const,
    width: 100,
    height: 100,
    fit: "cover" as const,
    lazy: true,
  },

  // Thumbnails - muito pequeno
  thumbnail: {
    quality: 70,
    format: "webp" as const,
    width: 150,
    height: 150,
    fit: "cover" as const,
    lazy: true,
  },

  // Hero images - alta qualidade mas otimizada
  hero: {
    quality: 90,
    format: "webp" as const,
    width: 1920,
    priority: true,
    lazy: false,
  },

  // Dashboard icons - pequeno e nítido
  icon: {
    quality: 90,
    format: "webp" as const,
    width: 64,
    height: 64,
    fit: "contain" as const,
    lazy: true,
  },
} as const;

// Detectar capacidades do dispositivo
export function getDeviceCapabilities() {
  // Verificar suporte a formatos modernos
  const supportsWebP = (() => {
    try {
      return (
        document
          .createElement("canvas")
          .toDataURL("image/webp", 0.5)
          .indexOf("data:image/webp") === 0
      );
    } catch {
      return false;
    }
  })();

  const supportsAVIF = (() => {
    try {
      return (
        document
          .createElement("canvas")
          .toDataURL("image/avif", 0.5)
          .indexOf("data:image/avif") === 0
      );
    } catch {
      return false;
    }
  })();

  // Detectar velocidade de conexão
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  const connectionSpeed = connection?.effectiveType || "4g";
  const isSlowConnection = ["slow-2g", "2g", "3g"].includes(connectionSpeed);

  // Detectar device pixel ratio
  const devicePixelRatio = window.devicePixelRatio || 1;

  // Detectar tamanho da tela
  const screenWidth = window.screen.width;
  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1024;

  return {
    supportsWebP,
    supportsAVIF,
    connectionSpeed,
    isSlowConnection,
    devicePixelRatio,
    screenWidth,
    isMobile,
    isTablet,
  };
}

// Gerar URL otimizada baseada nas capacidades do dispositivo
export function generateOptimizedImageUrl(
  src: string,
  options: ImageOptimizationOptions = {},
): string {
  // Se a imagem já é uma URL completa externa, retorna como está
  if (src.startsWith("http") && !src.includes("kryonix.com.br")) {
    return src;
  }

  const capabilities = getDeviceCapabilities();

  // Aplicar preset baseado no dispositivo se não especificado
  let finalOptions: ImageOptimizationOptions = { ...options };

  if (!options.width && !options.height) {
    if (capabilities.isMobile) {
      finalOptions = { ...OPTIMIZATION_PRESETS.mobile, ...options };
    } else if (capabilities.isTablet) {
      finalOptions = { ...OPTIMIZATION_PRESETS.tablet, ...options };
    } else {
      finalOptions = { ...OPTIMIZATION_PRESETS.desktop, ...options };
    }
  }

  // Ajustar qualidade baseado na conexão
  if (capabilities.isSlowConnection && !options.quality) {
    finalOptions.quality = Math.min(finalOptions.quality || 80, 60);
  }

  // Escolher formato baseado no suporte do browser
  let format = finalOptions.format || "auto";
  if (format === "auto") {
    if (capabilities.supportsAVIF) {
      format = "avif";
    } else if (capabilities.supportsWebP) {
      format = "webp";
    } else {
      format = "jpg";
    }
  }

  // Ajustar dimensões para device pixel ratio
  const adjustedWidth = finalOptions.width
    ? Math.round(
        finalOptions.width *
          (finalOptions.devicePixelRatio || capabilities.devicePixelRatio),
      )
    : undefined;

  const adjustedHeight = finalOptions.height
    ? Math.round(
        finalOptions.height *
          (finalOptions.devicePixelRatio || capabilities.devicePixelRatio),
      )
    : undefined;

  // Construir URL de otimização (usando CDN ou serviço próprio)
  const params = new URLSearchParams();

  if (adjustedWidth) params.set("w", adjustedWidth.toString());
  if (adjustedHeight) params.set("h", adjustedHeight.toString());
  if (finalOptions.quality) params.set("q", finalOptions.quality.toString());
  if (format && format !== "auto") params.set("f", format);
  if (finalOptions.fit) params.set("fit", finalOptions.fit);
  if (finalOptions.background) params.set("bg", finalOptions.background);
  if (finalOptions.blur) params.set("blur", finalOptions.blur.toString());
  if (finalOptions.sharpen) params.set("sharpen", "true");
  if (finalOptions.grayscale) params.set("grayscale", "true");

  // URL base do CDN ou otimizador local
  const baseUrl = process.env.REACT_APP_IMAGE_CDN || "/api/images/optimize";
  const imageUrl = src.startsWith("/") ? src : `/${src}`;

  return `${baseUrl}${imageUrl}?${params.toString()}`;
}

// Gerar srcset para diferentes resoluções
export function generateSrcSet(
  src: string,
  baseOptions: ImageOptimizationOptions = {},
): string {
  const breakpoints = [400, 800, 1200, 1600, 2000];

  return breakpoints
    .map((width) => {
      const url = generateOptimizedImageUrl(src, {
        ...baseOptions,
        width,
      });
      return `${url} ${width}w`;
    })
    .join(", ");
}

// Gerar sizes baseado em breakpoints responsivos
export function generateSizes(customSizes?: string): string {
  if (customSizes) return customSizes;

  return [
    "(max-width: 640px) 100vw",
    "(max-width: 768px) 80vw",
    "(max-width: 1024px) 60vw",
    "50vw",
  ].join(", ");
}

// Placeholder blur em base64
export function generateBlurPlaceholder(
  src: string,
  width: number = 20,
  height: number = 20,
): string {
  // Gerar versão extremamente pequena e borrada
  const blurUrl = generateOptimizedImageUrl(src, {
    width,
    height,
    quality: 10,
    blur: 10,
    format: "jpg", // JPG é menor para placeholders
  });

  return blurUrl;
}

// Cache de imagens no localStorage para PWA
export class ImageCache {
  private static readonly CACHE_KEY = "kryonix_image_cache";
  private static readonly MAX_CACHE_SIZE = 50; // Máximo de 50 imagens
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

  static async cacheImage(src: string, blob: Blob): Promise<void> {
    try {
      const cache = this.getCache();
      const base64 = await this.blobToBase64(blob);

      cache[src] = {
        data: base64,
        timestamp: Date.now(),
        size: blob.size,
      };

      // Limitar tamanho do cache
      this.pruneCache(cache);

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn("Falha ao cachear imagem:", error);
    }
  }

  static getCachedImage(src: string): string | null {
    try {
      const cache = this.getCache();
      const cached = cache[src];

      if (!cached) return null;

      // Verificar se não expirou
      if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
        delete cache[src];
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
        return null;
      }

      return cached.data;
    } catch (error) {
      console.warn("Falha ao recuperar imagem do cache:", error);
      return null;
    }
  }

  private static getCache(): Record<string, any> {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      return cache ? JSON.parse(cache) : {};
    } catch {
      return {};
    }
  }

  private static pruneCache(cache: Record<string, any>): void {
    const entries = Object.entries(cache);

    if (entries.length <= this.MAX_CACHE_SIZE) return;

    // Ordenar por timestamp (mais antigo primeiro)
    entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);

    // Remover os mais antigos
    const toRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => delete cache[key]);
  }

  private static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  static clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
  }

  static getCacheInfo() {
    const cache = this.getCache();
    const entries = Object.values(cache);

    return {
      count: entries.length,
      totalSize: entries.reduce(
        (sum: number, entry: any) => sum + (entry.size || 0),
        0,
      ),
      oldestTimestamp: Math.min(
        ...entries.map((entry: any) => entry.timestamp),
      ),
      newestTimestamp: Math.max(
        ...entries.map((entry: any) => entry.timestamp),
      ),
    };
  }
}

// Hook para carregamento lazy com otimização
export function useOptimizedImage(
  src: string,
  options: ImageOptimizationOptions = {},
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [cachedSrc, setCachedSrc] = useState<string | null>(null);

  useEffect(() => {
    // Verificar cache primeiro
    const cached = ImageCache.getCachedImage(src);
    if (cached) {
      setCachedSrc(cached);
      setIsLoaded(true);
      return;
    }

    // Carregar imagem otimizada
    const optimizedSrc = generateOptimizedImageUrl(src, options);
    const img = new Image();

    img.onload = () => {
      setIsLoaded(true);
      setCachedSrc(optimizedSrc);

      // Cachear se for uma imagem pequena
      if (options.width && options.width <= 400) {
        fetch(optimizedSrc)
          .then((response) => response.blob())
          .then((blob) => ImageCache.cacheImage(src, blob))
          .catch(() => {}); // Silent fail
      }
    };

    img.onerror = () => setIsError(true);
    img.src = optimizedSrc;
  }, [src, options]);

  return {
    src: cachedSrc || generateOptimizedImageUrl(src, options),
    isLoaded,
    isError,
    placeholder: generateBlurPlaceholder(src),
  };
}

// Métricas de performance de imagens
export class ImagePerformanceMonitor {
  private static metrics: Array<{
    src: string;
    loadTime: number;
    size: number;
    format: string;
    fromCache: boolean;
    timestamp: number;
  }> = [];

  static recordImageLoad(data: {
    src: string;
    loadTime: number;
    size?: number;
    format?: string;
    fromCache?: boolean;
  }) {
    this.metrics.push({
      ...data,
      size: data.size || 0,
      format: data.format || "unknown",
      fromCache: data.fromCache || false,
      timestamp: Date.now(),
    });

    // Manter apenas os últimos 100 registros
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  static getMetrics() {
    const totalImages = this.metrics.length;
    const averageLoadTime =
      this.metrics.reduce((sum, m) => sum + m.loadTime, 0) / totalImages;
    const totalSize = this.metrics.reduce((sum, m) => sum + m.size, 0);
    const cacheHitRate =
      this.metrics.filter((m) => m.fromCache).length / totalImages;

    const formatStats = this.metrics.reduce(
      (stats, m) => {
        stats[m.format] = (stats[m.format] || 0) + 1;
        return stats;
      },
      {} as Record<string, number>,
    );

    return {
      totalImages,
      averageLoadTime,
      totalSize,
      cacheHitRate,
      formatStats,
      recentMetrics: this.metrics.slice(-10),
    };
  }

  static clearMetrics() {
    this.metrics = [];
  }
}

export default {
  generateOptimizedImageUrl,
  generateSrcSet,
  generateSizes,
  generateBlurPlaceholder,
  getDeviceCapabilities,
  useOptimizedImage,
  ImageCache,
  ImagePerformanceMonitor,
  OPTIMIZATION_PRESETS,
};
