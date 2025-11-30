import React, { useState, useEffect } from 'react';
import { bannersService } from '../services/api';
import './BannerCarousel.css';

interface Banner {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  link: string;
  orden: number;
}

const BannerCarousel: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannersService.getAll();
        setBanners(response.data);
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      (prevIndex + 1) % banners.length
    );
  };

  if (loading || banners.length === 0) {
    return null; // No mostrar nada si no hay banners o está cargando
  }

  return (
    <div className="banner-carousel-container">
      <div
        className="banner-carousel-track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="banner-slide">
            {banner.link ? (
              <a href={banner.link} target="_blank" rel="noopener noreferrer" className="banner-link">
                <img src={banner.imagen} alt={banner.titulo} className="banner-image" />
                {(banner.titulo || banner.descripcion) && (
                  <div className="banner-content">
                    {banner.titulo && <h3>{banner.titulo}</h3>}
                    {banner.descripcion && <p>{banner.descripcion}</p>}
                  </div>
                )}
              </a>
            ) : (
              <div className="banner-no-link">
                <img src={banner.imagen} alt={banner.titulo} className="banner-image" />
                {(banner.titulo || banner.descripcion) && (
                  <div className="banner-content">
                    {banner.titulo && <h3>{banner.titulo}</h3>}
                    {banner.descripcion && <p>{banner.descripcion}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button className="banner-arrow banner-prev" onClick={goToPrev}>
            &#10094;
          </button>
          <button className="banner-arrow banner-next" onClick={goToNext}>
            &#10095;
          </button>

          <div className="banner-dots">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`banner-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;
