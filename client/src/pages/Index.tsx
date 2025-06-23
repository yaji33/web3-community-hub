import { useState } from 'react';
import { ProjectNavigation } from '@/components/ProjectNavigation';
import { SentimentSection } from '@/pages/SentimentSection';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const Index = () => {
  // State to manage the currently active project
  const [activeProject, setActiveProject] = useState('Magic Newton');

  const handleProjectChange = (project: string) => {
    setActiveProject(project);
  };

  return (
    <div className="min-h-screen w-full bg-main-background antialiased">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-12">
        <ProjectNavigation
          activeProject={activeProject}
          onProjectChange={handleProjectChange}
        />
        <SentimentSection activeProject={activeProject} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
