import { ProjectNavigation } from '@/components/ProjectNavigation';
import { SentimentSection } from '@/pages/SentimentSection'
import { Header } from '@/components/Header';

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-main-background antialiased">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-12">
        <ProjectNavigation />
        <SentimentSection />
      </main>
    </div>
  );
};

export default Index;
