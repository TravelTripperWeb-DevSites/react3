import React from 'react';
import { useSiteData } from 'react-static'
import { parseHtml, useModel } from '../pegs-web';


const SingleSlide = (slilderimages, idx, page) => {
  const first = idx == 0;
  let rootClass = 'item';
  if (first) {
    rootClass += ' active'
  }
  
  const rootStyle = {
    backgroundImage: `url(${ slilderimages.slider_image ? slilderimages.slider_image.url : '' })`,
    backgroundSize: 'cover',
    backgroundPosition: "center" 
  }
  
  return  <div key={`slide-${idx+1}`}className={rootClass} style={rootStyle} title={`${ slilderimages.alt_text }`}>
  <div className="carousel-caption transparent-bg">
    <div className="caption-inner">
       { parseHtml(slilderimages.carousel_caption, page) }
    </div>
  </div>

  <div className="caption-price" style={{display:"none"}}>
    <p className="price-holder" ng-show="recentBookings.totalBookings > 5"><span aria-label="[[recentBookings.totalBookings]] People booked our hotel in the last 2 days" role="heading">[[ recentBookings.totalBookings ]]</span>People booked our hotel in the last 2 days</p>
    <div className="price-holder tonight" ng-show="!browser.otaRates.brgFound && browser.isRate">
      <a href="https://24northhotel.reztrip.com/search?" target="_blank" className="homeTonightRate" title="Tonight’s Rate" tabIndex="-1"><span tabIndex="-1">[[ browser.toNightsRate ]]</span>Tonight’s Rate</a>
    </div>
  </div>

  <div className="price-wrap1" ng-show="browser.isRate" style={{display:"none"}}>
     <div className="best-rate-ota" ng-show ="browser.otaRates.brgFound" >
        <div className="boxes">
          <div className="tonight-rate ">
          <p>Best Price Available</p>
          <a href="https://24northhotel.reztrip.com/search?" target="_blank" className="homeTonightRate" title="Browse Rates" tabIndex="-1">
            <p className="h4">{"Tonight’s"} Rate <span className="price">[[browser.otaRates.reztripRate]]</span></p>
          </a>
          </div>
          <div className="ota-list" >
            <ul>
            <li ng-repeat = "(key, value) in browser.otaRates.brg">[[key]] <span>$[[value]]</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
  
}


const HomePageSlider = ({page}) => {
  const [sliderImages, setSliderImages] = useModel(page, 'homepage_slider')
  
  console.log(sliderImages);
  
  let slides = [];
  let idx = 0;

  for (let sliderImageId in sliderImages) {
    const sliderImage = sliderImages[sliderImageId]
    slides.push(SingleSlide(sliderImage, idx, page))
    idx += 1;
  }
  
  return <div className="carousel-inner" rt3-recent-bookings="recentBookings"  ng-cloak tabIndex="-1">
        {slides}
      </div>
  
}

export default HomePageSlider;

