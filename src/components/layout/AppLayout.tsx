import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { LanguageEntryModal } from './LanguageEntryModal';
import { useLanguage } from '../../context/LanguageContext';

export const AppLayout: React.FC = () => {
  const { dir, isUrdu } = useLanguage();

  return (
    <div 
      dir={dir} 
      className={`min-h-screen flex flex-col bg-canvas text-content selection:bg-primary-subtle selection:text-primary ${
        isUrdu ? 'font-urdu-body' : 'font-sans'
      }`}
    >
      <LanguageEntryModal />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
