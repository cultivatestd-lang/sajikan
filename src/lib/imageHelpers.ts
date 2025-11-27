const UNSPLASH_FALLBACK = 'https://source.unsplash.com/800x600/?indonesian,food';
const PROXY_BASE = 'https://images.weserv.nl/';

const toProxyUrl = (url: string): string => {
  const sanitized = url.replace(/^https?:\/\//, '');
  const encoded = encodeURIComponent(sanitized);
  return `${PROXY_BASE}?url=${encoded}&w=800&h=600&fit=cover&we=1`;
};

export const getRecipeImageSrc = (image?: string): string => {
  if (!image || !image.trim()) {
    return UNSPLASH_FALLBACK;
  }

  if (/^https?:\/\//.test(image)) {
    return toProxyUrl(image.trim());
  }

  return `https://source.unsplash.com/800x600/?${encodeURIComponent(image)}`;
};

