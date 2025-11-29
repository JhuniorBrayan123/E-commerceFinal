/**
 * Utilidad para construir URLs de imágenes correctas
 * Maneja URLs relativas y absolutas del backend Django
 */

import { SERVICES } from "../config/services";

// Extraer la URL base del servicio de catálogo (sin /api)
const CATALOG_BASE_URL = SERVICES.CATALOG.replace("/api", "") || "http://localhost:8000";

/**
 * Construye la URL completa de una imagen
 * @param imagePath - Ruta de la imagen (puede ser relativa o absoluta)
 * @returns URL completa de la imagen
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return "";
  }

  // Si ya es una URL completa (http:// o https://), retornarla tal cual
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Si empieza con /media/, agregar el dominio base
  if (imagePath.startsWith("/media/")) {
    return `${CATALOG_BASE_URL}${imagePath}`;
  }

  // Si es una ruta relativa sin /media/, agregarlo
  if (!imagePath.startsWith("/")) {
    return `${CATALOG_BASE_URL}/media/${imagePath}`;
  }

  // Si empieza con / pero no es /media/, asumir que es relativa al backend
  return `${CATALOG_BASE_URL}${imagePath}`;
};

/**
 * Obtiene la URL del banner
 * @param bannerPath - Ruta del banner
 * @returns URL completa del banner
 */
export const getBannerUrl = (bannerPath: string | null | undefined): string => {
  return getImageUrl(bannerPath);
};

