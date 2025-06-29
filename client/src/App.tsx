import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContext } from '@/context/ToastContext';
import Index from './pages/Index';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/*<Toaster />
      <Sonner />*/}
      <ToastContext>
        <BrowserRouter>
          <div className="min-h-screen w-full bg-background text-foreground antialiased">
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              {/*<Route path="*" element={<NotFound />} /> */}
            </Routes>
          </div>
        </BrowserRouter>
      </ToastContext>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
