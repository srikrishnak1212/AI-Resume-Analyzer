import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * AppLayout — The core dashboard layout wrapper.
 * Integrates sticky Navbar, persistent/collapsible Sidebar, and responsive content canvas.
 *
 * Reference: UI-Guide.md §5.4 (Grid System), §6.1, §6.2, §9 (Responsiveness)
 * Rule: Functional Component + Hooks only (PROJECT_RULES.md)
 */
const AppLayout = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Navbar */}
      <Navbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

      <div className="flex flex-1 relative">
        {/* Navigation Sidebar */}
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 px-4 py-6 md:p-8 max-w-[1440px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
