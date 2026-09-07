'use client';

import { env } from '@/env';
import { useEffect } from 'react';

const position = {
  lat: 37.5292898,
  lng: 126.9542816,
};

export default function BrikkaMap() {
  useEffect(() => {
    const kakaoMapScript = document.createElement('script');
    kakaoMapScript.defer = true;
    kakaoMapScript.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${env.NEXT_PUBLIC_KAKAO_APP_JAVASCRIPT_KEY}&autoload=false&libraries=clusterer`;
    document.head.appendChild(kakaoMapScript);

    const onLoadKakaoAPI = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById('map');
        const options = {
          center: new window.kakao.maps.LatLng(position.lat, position.lng),
          level: 1,
        };
        const map = new window.kakao.maps.Map(container, options);
        const customOverlay = new window.kakao.maps.CustomOverlay({
          map: map,
          position: new window.kakao.maps.LatLng(position.lat, position.lng),
          content: `<div class="relative flex h-[36px] w-[96px] lg:h-[48px] lg:w-[128px] items-center justify-center bg-apc-orange-400">
          <span class="body-lg-medium text-apc-black-900">BRIKKA</span>
          <div class="absolute w-[10px] h-[10px] left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 rotate-45 bg-apc-orange-400"></div>
          </div>`,
          yAnchor: 1,
        });
        customOverlay.setVisible(true);
      });
    };
    kakaoMapScript.addEventListener('load', onLoadKakaoAPI);

    return () => {
      kakaoMapScript.removeEventListener('load', onLoadKakaoAPI);
    };
  }, []);
  return (
    <div className="relative w-full pt-[52%]">
      <div id="map" className="absolute inset-0" />
    </div>
  );
}
