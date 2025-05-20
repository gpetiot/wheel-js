import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full py-4 mt-auto border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Wheel Spinner. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
