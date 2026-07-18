import { useState, useEffect } from "react";
import { useInvoiceXRay } from "./hooks/useInvoiceXRay";
import { Sidebar } from "./components/Sidebar";
import { MetricsOverview } from "./components/MetricsOverview";
import { TransactionsTable } from "./components/TransactionsTable";
import { AuditPage } from "./components/Pages/AuditPage";
import { ReportsPage } from "./components/Pages/ReportsPage";
import { BenchmarksPage } from "./components/Pages/BenchmarksPage";
import { SplashPreloader } from "./components/SplashPreloader";
import { CheckCircle, Menu, X, ShieldAlert, Sun, Moon } from "lucide-react";

export function App() {
  const [activePage, setActivePage] = useState<"dashboard" | "audit" | "reports" | "benchmarks">("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
    }
    return "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const {
    evaluations,
    transactionIds,
    filteredEvaluations,
    aggregateMetrics,
    isEvaluating,
    selectedId,
    setSelectedId,
    selectedEvaluation,
    evaluateAll,
    generateCounterfactualReport,
    generateRBIFormETX,
    exportSTRNarrative,
    searchQuery,
    setSearchQuery,
    riskFilter,
    setRiskFilter,
    toastMessage,
    showToast,
    benchmarks,
    isLoadingBenchmarks,
    fetchBenchmarks,
  } = useInvoiceXRay();

  const handleSelectTransaction = (id: string, targetView?: "audit" | "reports") => {
    setSelectedId(id);
    if (targetView) {
      setActivePage(targetView);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col md:flex-row selection:bg-red-500/30 selection:text-white">
      {/* Website Entry Preloader Splash Screen */}
      <SplashPreloader />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-red-500/40 text-red-400 px-5 py-3 rounded-xl shadow-2xl font-mono text-xs flex items-center gap-2.5 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-zinc-950 border-b border-zinc-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <span className="font-extrabold text-white text-base">INVOICEX-RAY</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
            title="Toggle color theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-300"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Component */}
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block z-30`}>
        <Sidebar
          activePage={activePage}
          onNavigate={(page) => {
            setActivePage(page);
            setSidebarOpen(false);
          }}
          selectedId={selectedId}
          onSelectTransaction={(id) => {
            handleSelectTransaction(id);
            setSidebarOpen(false);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onReevaluateAll={evaluateAll}
          isEvaluating={isEvaluating}
          transactionIds={transactionIds}
          evaluations={evaluations}
        />
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 p-6 md:p-8 max-w-[1600px] overflow-y-auto">
        {/* Page 1: Dashboard */}
        {activePage === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">
                  Risk Overview & Compliance Dashboard
                </h1>
                <p className="text-sm text-zinc-400 font-mono mt-1">
                  Live Trade-Based Money Laundering (TBML) Monitoring System
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono font-semibold transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
                  title="Toggle color theme"
                >
                  {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>{theme === "dark" ? "LIGHT" : "DARK"}</span>
                </button>

                <span className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
                  SELECTED INVOICE: <strong className="text-red-400">{selectedId}</strong>
                </span>
              </div>
            </div>

            <MetricsOverview metrics={aggregateMetrics} />

            <TransactionsTable
              evaluations={filteredEvaluations}
              selectedId={selectedId}
              onSelectTransaction={(id, view) => {
                handleSelectTransaction(id, view || "audit");
              }}
              riskFilter={riskFilter}
              onRiskFilterChange={setRiskFilter}
            />
          </div>
        )}

        {/* Page 2: Audit Deep-Dive */}
        {activePage === "audit" && (
          <AuditPage
            evaluation={selectedEvaluation}
            selectedId={selectedId}
            onSelectTransaction={(id) => handleSelectTransaction(id)}
            onNavigate={setActivePage}
            transactionIds={transactionIds}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}

        {/* Page 3: Reports & Filings Hub */}
        {activePage === "reports" && (
          <ReportsPage
            evaluation={selectedEvaluation}
            selectedId={selectedId}
            onSelectTransaction={(id) => handleSelectTransaction(id)}
            generateCounterfactualReport={generateCounterfactualReport}
            generateRBIFormETX={generateRBIFormETX}
            exportSTRNarrative={exportSTRNarrative}
            showToast={showToast}
            transactionIds={transactionIds}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}

        {/* Page 4: Independent Commodity Benchmarks */}
        {activePage === "benchmarks" && (
          <BenchmarksPage
            benchmarks={benchmarks}
            isLoading={isLoadingBenchmarks}
            onRefresh={fetchBenchmarks}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}
      </main>
    </div>
  );
}

export default App;
