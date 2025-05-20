import React from 'react';
import WheelSpinner from './components/WheelSpinner';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans antialiased bg-gray-50 text-gray-900 box-border">
      <main className="flex-grow">
        <WheelSpinner />
      </main>
      <Footer />
    </div>
  );
}

export default App;
