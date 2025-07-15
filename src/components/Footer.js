import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full py-4 mt-auto border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="text-center text-sm text-gray-600">
          © {new Date().getFullYear()} wheel-js
          <span className="mx-2">-</span>
          View source on{' '}
          <a
            href="https://github.com/gpetiot/wheel-js"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
