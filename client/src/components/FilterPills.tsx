/*
 * DESIGN: Artesanía Digital — filter pills with live result count badges.
 * Implements audit P1: each pill shows the number of matching workers,
 * and the scrollable container has a fade gradient on mobile for scroll affordance.
 */

import { TRADES, type Trade, type Maestro } from "@/data/mockMaestros";

interface FilterPillsProps {
  activeFilter: Trade;
  setActiveFilter: (f: Trade) => void;
  maestros: Maestro[];
  allMaestros: Maestro[];
}

export default function FilterPills({ activeFilter, setActiveFilter, maestros, allMaestros }: FilterPillsProps) {
  const getCount = (trade: Trade) => {
    if (trade === "Todos") return allMaestros.length;
    return allMaestros.filter((m) => m.tradeCategory === trade).length;
  };

  return (
    <div className="relative w-full">
      {/* Mobile scroll gradient */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden z-10" />

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TRADES.map((trade) => {
          const isActive = activeFilter === trade;
          const count = getCount(trade);
          return (
            <button
              key={trade}
              onClick={() => setActiveFilter(trade)}
              className={`
                flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap
                transition-all duration-150 active:scale-[0.97] flex-shrink-0
                ${
                  isActive
                    ? "bg-terracotta text-white shadow-sm"
                    : "bg-card text-foreground border border-border hover:border-terracotta/30 hover:bg-secondary"
                }
              `}
            >
              {trade}
              <span
                className={`
                  text-[11px] font-bold px-1.5 py-0.5 rounded-full
                  ${isActive ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"}
                `}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
