import React, { Fragment } from "react";
import Layout from "../../layouts/Layout";
import HeroSlider from "../../wrappers/hero-slider/HeroSlider";
import TabProduct from "../../wrappers/product/TabProduct";
import FeatureIcon from "../../wrappers/feature-icon/FeatureIcon";
import BestSellersSection from "../../wrappers/product/BestSellersSection";


const Home = () => {
  
  return (
    <Fragment>
      <Layout
        headerContainerClass="container-fluid"
        headerPaddingClass="header-padding-2"
        headerTop="visible"
      >
         <HeroSlider />
        <TabProduct spaceBottomClass="pb-60" category="furniture" />
        <BestSellersSection />
        <FeatureIcon spaceTopClass="pt-100" spaceBottomClass="pb-60" />
      </Layout>
    </Fragment>
  );
};

export default Home;


