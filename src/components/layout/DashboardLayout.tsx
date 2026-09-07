import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { AddItemModal } from "@/components/modals/AddItemModal";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { AppDataProvider } from "@/context/AppDataContext";

const SIDEBAR_COLLAPSED_STORAGE_KEY = "my-space-pad:sidebar-collapsed";

function getInitialCollapsedState(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function DashboardLayout(): JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(getInitialCollapsedState);

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(isSidebarCollapsed));
    } catch {
      // Armazenamento indisponível (ex: modo privado) — apenas ignora, sem quebrar a UI.
    }
  }, [isSidebarCollapsed]);

  return (
    <AppDataProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            onMenuClick={() => setIsSidebarOpen(true)}
            onAddItemClick={() => setIsAddItemModalOpen(true)}
          />

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>

        <AddItemModal isOpen={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)} />
        <ScrollToTopButton />
      </div>
    </AppDataProvider>
  );
}
