import { useEffect, useState } from 'react';
import { EffectFade } from 'swiper/modules';
import Swiper, { SwiperSlide } from "../../components/swiper/index.jsx";
import sliderData from "../../data/hero-sliders/hero-slider-nineteen.json";
import HeroSliderNineteenSingle from "../../components/hero-slider/HeroSliderNineteenSingle.js";
import { getHeroSlides } from "../../Services/slider-api";

const params = {
  effect: "fade",
  fadeEffect: {
    crossFade: true
  },
  modules: [EffectFade],
  loop: true,
  speed: 1000,
  navigation: true,
  autoHeight: false,
  autoplay: {
    delay: 3000,
    disableOnInteraction: false
  }
};

const normalizeSlides = (slides = []) => (
  slides.map((slide, idx) => ({
    id: slide.id ?? `slide-${idx}`,
    title: slide.title || '',
    subtitle: slide.subtitle || '',
    image: slide.image || slide.imageUrl || '',
    url: slide.url || slide.href || '/shop-grid-standard'
  }))
);

const HeroSlider = () => {
  const [slides, setSlides] = useState(() => normalizeSlides(sliderData));

  useEffect(() => {
    let cancelled = false;
    async function fetchSlides() {
      try {
        const response = await getHeroSlides();
        const list = normalizeSlides(response?.slides || response || []);
        if (!cancelled && list.length) setSlides(list);
      } catch (err) {
        console.warn('Falling back to bundled hero slider data', err);
      }
    }
    fetchSlides();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="slider-area">
      <div className="slider-active nav-style-1">
        {slides && slides.length > 0 && (
          <Swiper options={params}>
            {slides.map((single) => (
              <SwiperSlide key={single.id}>
                <HeroSliderNineteenSingle
                  data={single}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
};

export default HeroSlider;


