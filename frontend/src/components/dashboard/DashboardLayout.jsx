import React, { useState } from 'react';
import TopNavbar from './TopNavbar';
import Sidebar from './Sidebar';

/**
 * DashboardLayout — Layout grid linking TopNavbar, Sidebar, and child contents together.
 *
 * Reference: UI-Guide.md §5.4 (Grid System), §9 (Responsiveness)
 * Rule: Functional Component + Tailwind (PROJECT_RULES.md)
 */
const DashboardLayout = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
      <div className="flex flex-1 relative">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
        <main className="flex-1 px-4 py-6 md:p-8 max-w-[1440px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
