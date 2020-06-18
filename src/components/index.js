import React from 'react';
import { makeTBDComponent } from '../pegs-web/components/TBDComponent';
import HomePageSlider from './HomePageSlider';
import BlogExcerpt from './BlogExcerpt';

const Header = makeTBDComponent("Header");
const TopBanner = makeTBDComponent("TopBanner");


const SpecialOffers = makeTBDComponent("SpecialOffers");
const Grid = makeTBDComponent("Grid");
const Location = makeTBDComponent("Location");
const BlogAside = makeTBDComponent("BlogAside");
const SocialShare = makeTBDComponent("SocialShare");
const Footer = makeTBDComponent("Footer");

const FacebookComments = makeTBDComponent("FacebookComments")
// <div className="fb-comments" expr:href='data:post.url' data-numposts="5"></div>

export {
  Header,
  TopBanner,
  HomePageSlider,
  SpecialOffers,
  Footer,
  Location,
  BlogExcerpt,
  BlogAside,
  SocialShare,
  FacebookComments,
  Grid
}