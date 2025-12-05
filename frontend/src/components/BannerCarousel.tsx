import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { marketingService } from "../services/api";
import { getBannerUrl } from "../utils/imageUtils";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

interface Banner {
  id: number;
  titulo: string;
  imagen: string;
}

const BannerCarousel = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await marketingService.getBanners();
        // DRF puede devolver diferentes formatos:
        // - { results: [...] } con paginación
        // - Array directo [ ... ]
        // - { data: [...] }
        let bannersData = [];
        if (response.data) {
          if (Array.isArray(response.data)) {
            bannersData = response.data;
          } else if (
            response.data.results &&
            Array.isArray(response.data.results)
          ) {
            bannersData = response.data.results;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            bannersData = response.data.data;
          }
        }
        setBanners(bannersData);
      } catch (err) {
        console.error("Error cargando banners:", err);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[350px] bg-gray-200 flex items-center justify-center rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Si no hay banners, no mostrar nada (pero no retornar null para evitar problemas de renderizado)
  if (banners.length === 0) {
    return <div className="w-full h-0"></div>; // Div vacío con altura 0 para mantener el layout
  }

  return (
    <div className="w-full ">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3500 }}
        loop={banners.length > 1}
        spaceBetween={0}
        slidesPerView={1}
        className="shadow-lg rounded-lg overflow-hidden"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <img
              src={getBannerUrl(banner.imagen)}
              alt={banner.titulo}
              className="w-full h-auto rounded-lg object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[400px] bg-gray-200 flex items-center justify-center rounded-lg"><span class="text-gray-400">Banner no disponible</span></div>`;
                }
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BannerCarousel;
