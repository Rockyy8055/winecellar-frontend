import { EffectFade } from 'swiper/modules';
import Swiper, { SwiperSlide } from "../../components/swiper/index.jsx";
import sliderData from "../../data/hero-sliders/hero-slider-nineteen.json";
import HeroSliderNineteenSingle from "../../components/hero-slider/HeroSliderNineteenSingle.js";

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

const HeroSlider = () => {
  return (
    <div className="slider-area">
      <div className="slider-active nav-style-1">
        {sliderData && (
          <Swiper options={params}>
            {sliderData?.map((single, key) => (
              <SwiperSlide key={key}>
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
