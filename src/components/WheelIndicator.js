import React from 'react';

const WheelIndicator = () => {
  return (
    <div
      className="absolute top-1/2 right-[-16px] -translate-y-1/2 w-0 h-0 
      border-t-[15px] border-t-transparent 
      border-b-[15px] border-b-transparent 
      border-r-[45px] border-r-rose-500
      filter drop-shadow-md z-10
      before:absolute before:content-[''] before:right-[-47px] before:top-[-17px] 
      before:border-t-[17px] before:border-t-transparent 
      before:border-b-[17px] before:border-b-transparent 
      before:border-r-[49px] before:border-r-rose-500/50"
    ></div>
  );
};

export default WheelIndicator;
