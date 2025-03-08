import React from 'react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-black -translate-x-1/2 ">
      <img 
        src="/loading.gif" 
        alt="Loading..." 
        className="w-[200px] h-[200px]"
      />
    </div>
  );
};

export default Loading;
