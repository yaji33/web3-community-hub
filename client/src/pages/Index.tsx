import React from 'react';
import { ProjectNavigation } from '@/components/ProjectNavigation';
import { Header } from '@/components/Header';

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-12">
        <ProjectNavigation />
      </main>
    </div>
  );
};

export default Index;
