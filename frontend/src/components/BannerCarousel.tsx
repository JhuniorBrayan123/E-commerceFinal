import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Banner {
  id: number;
  titulo: string;
  imagen: string;
}

const BannerCarousel = () => {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/banners/")
      .then((res) => res.json())
      .then((data) => setBanners(data.results))
      .catch((err) => console.error("Error cargando banners:", err));
  }, []);

  return (
    <div className="w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3500 }}
        loop
        spaceBetween={20}
        slidesPerView={1}
        className=" shadow-lg"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <img
              src={banner.imagen}
              alt={banner.titulo}
              className="w-full h-[350px] object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BannerCarousel;
