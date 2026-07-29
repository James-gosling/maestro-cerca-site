/*
 * DESIGN: Artesanía Digital — friendly empty state with recovery CTA.
 * Implements audit P2: when combined search + filter returns 0 results,
 * shows a clear message with actionable recovery options.
 */

import { SearchX } from "lucide-react";

interface EmptyStateProps {
  query: string;
  filter: string;
  onClearQuery: () => void;
  onClearFilter: () => void;
}

export default function EmptyState({ query, filter, onClearQuery, onClearFilter }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <SearchX size={28} className="text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">Sin resultados</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {query && filter !== "Todos"
          ? `No encontramos maestros en "${filter}" que coincidan con "${query}". Intenta ampliar tu búsqueda.`
          : query
          ? `No encontramos resultados para "${query}". Prueba con otro término de búsqueda.`
          : `No hay maestros disponibles en esta categoría.`}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {query && (
          <button
            onClick={onClearQuery}
            className="text-sm font-medium px-5 py-2.5 bg-secondary text-foreground border border-border rounded-xl hover:bg-muted transition-colors"
          >
            Limpiar búsqueda
          </button>
        )}
        {filter !== "Todos" && (
          <button
            onClick={onClearFilter}
            className="text-sm font-medium px-5 py-2.5 bg-terracotta text-white rounded-xl hover:bg-terracotta-dark transition-colors"
          >
            Mostrar todos los {filter}
          </button>
        )}
      </div>
    </div>
  );
}
