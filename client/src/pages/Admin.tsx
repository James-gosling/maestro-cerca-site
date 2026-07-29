import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldX,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  FileImage,
  ArrowLeft,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

type MaestroWithExtra = {
  id: number;
  name: string;
  phone: string;
  trade: string;
  experience: number | null;
  workType: string | null;
  zone: string;
  verificationStatus: string | null;
  galleryImages: { url: string; caption: string; key: string }[];
  idDocumentKey: string | null;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  profileUrl: string;
  latitude: number | null;
  longitude: number | null;
};

export default function Admin() {
  const { user, loading: authLoading, isAuthenticated } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const [, setLocation] = useLocation();

  // Auth guard: redirect non-admin users to home after auth resolves
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) return; // let redirectOnUnauthenticated handle it
    if (user?.role !== "admin") {
      setAccessDenied(true);
      toast.error("Acceso denegado. Solo administradores pueden ver esta página.");
      setTimeout(() => setLocation("/"), 1500);
    }
  }, [authLoading, isAuthenticated, user?.role, setLocation]);

  // Show nothing while auth is loading or access is denied
  if (authLoading || accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">
            {authLoading ? "Verificando acceso..." : "Redirigiendo..."}
          </span>
        </div>
      </div>
    );
  }

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterTab, setFilterTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  const utils = trpc.useUtils();

  // Fetch data based on active tab
  const pendingQuery = trpc.maestros.listPending.useQuery(undefined, {
    enabled: filterTab === "pending",
    refetchOnWindowFocus: true,
  });

  const allQuery = trpc.maestros.listAll.useQuery(undefined, {
    enabled: filterTab === "all",
    refetchOnWindowFocus: true,
  });

  const statsQuery = trpc.maestros.stats.useQuery(undefined);

  // For "approved" or "rejected" tabs, filter from the "all" query
  const allData = allQuery.data ?? [];
  const filteredMaestros: MaestroWithExtra[] = (() => {
    if (filterTab === "pending") return pendingQuery.data ?? [];
    if (filterTab === "all") return allData;
    return allData.filter((m) => m.verificationStatus === filterTab);
  })();

  const isLoading = filterTab === "pending" ? pendingQuery.isLoading : allQuery.isLoading;

  // Mutations
  const approveMutation = trpc.maestros.approve.useMutation({
    onSuccess: (data) => {
      toast.success(`Maestro #${data.id} aprobado exitosamente`);
      utils.maestros.listPending.invalidate();
      utils.maestros.listAll.invalidate();
      utils.maestros.stats.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Error al aprobar");
    },
  });

  const rejectMutation = trpc.maestros.reject.useMutation({
    onSuccess: (data) => {
      toast.success(`Maestro #${data.id} rechazado`);
      utils.maestros.listPending.invalidate();
      utils.maestros.listAll.invalidate();
      utils.maestros.stats.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Error al rechazar");
    },
  });

  const handleApprove = (id: number) => {
    approveMutation.mutate({ id });
  };

  const handleReject = (id: number) => {
    rejectMutation.mutate({ id });
  };

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={12} />
            Aprobado
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <XCircle size={12} />
            Rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            <Clock size={12} />
            Pendiente
          </span>
        );
    }
  };

  const tabs = [
    { key: "pending" as const, label: "Pendientes", count: statsQuery.data?.pending ?? 0, icon: Clock },
    { key: "approved" as const, label: "Aprobados", count: statsQuery.data?.approved ?? 0, icon: CheckCircle2 },
    { key: "rejected" as const, label: "Rechazados", count: statsQuery.data?.rejected ?? 0, icon: XCircle },
    { key: "all" as const, label: "Todos", count: statsQuery.data?.total ?? 0, icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header Bar ── */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation("/")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Volver al sitio</span>
            </button>
            <div className="h-6 w-px bg-border/50" />
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-terracotta" />
              <h1 className="text-lg font-semibold text-foreground">
                Panel de Administración
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {user?.name || user?.email || "Admin"}
            </span>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-amber-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Pendientes
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {statsQuery.data?.pending ?? 0}
            </p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Aprobados
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {statsQuery.data?.approved ?? 0}
            </p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={16} className="text-red-500" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Rechazados
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {statsQuery.data?.rejected ?? 0}
            </p>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-terracotta" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {statsQuery.data?.total ?? 0}
            </p>
          </div>
        </div>

        {/* ── Tab Filter ── */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setFilterTab(tab.key);
                setExpandedId(null);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filterTab === tab.key
                  ? "bg-terracotta text-white shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border/50"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* ── Maestro Queue ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Cargando...</span>
            </div>
          </div>
        ) : filteredMaestros.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-card border border-border/50 flex items-center justify-center mb-4">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <p className="text-lg font-medium text-foreground mb-1">
              Sin registros en esta categoría
            </p>
            <p className="text-sm text-muted-foreground">
              {filterTab === "pending"
                ? "Todos los maestros han sido revisados."
                : "No hay registros que mostrar."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMaestros.map((maestro) => {
              const isExpanded = expandedId === maestro.id;
              return (
                <div
                  key={maestro.id}
                  className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* ── Summary Row ── */}
                  <div
                    className="flex items-center justify-between px-5 py-4 cursor-pointer select-none"
                    onClick={() => toggleExpand(maestro.id)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Avatar placeholder */}
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-terracotta to-terracotta/70 flex items-center justify-center shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {maestro.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground truncate">
                            {maestro.name}
                          </p>
                          {getStatusBadge(maestro.verificationStatus)}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {maestro.trade} &middot; {maestro.zone}
                          {maestro.experience
                            ? ` &middot; ${maestro.experience} años exp.`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {new Date(maestro.createdAt).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-muted-foreground" />
                      ) : (
                        <ChevronDown size={18} className="text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* ── Expanded Detail Panel ── */}
                  {isExpanded && (
                    <div className="border-t border-border/50 px-5 py-5 bg-muted/30">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Registration Details */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                            <Eye size={14} />
                            Detalles del Registro
                          </h4>
                          <div className="space-y-2 text-sm">
                            <DetailRow label="Nombre" value={maestro.name} />
                            <DetailRow label="Teléfono" value={maestro.phone} />
                            <DetailRow label="Oficio" value={maestro.trade} />
                            <DetailRow
                              label="Experiencia"
                              value={
                                maestro.experience
                                  ? `${maestro.experience} años`
                                  : "No especificada"
                              }
                            />
                            <DetailRow label="Zona" value={maestro.zone} />
                            <DetailRow
                              label="Tipo de trabajo"
                              value={maestro.workType ?? "No especificado"}
                            />
                            <DetailRow
                              label="Documento ID"
                              value={
                                maestro.idDocumentKey
                                  ? "Sí (ver abajo)"
                                  : "No proporcionado"
                              }
                            />
                            <DetailRow
                              label="Fotos portafolio"
                              value={`${maestro.galleryImages?.length ?? 0} fotos`}
                            />
                            <DetailRow
                              label="Registrado"
                              value={new Date(maestro.createdAt).toLocaleString(
                                "es-MX",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            />
                          </div>

                          {/* Action Buttons — only for pending */}
                          {maestro.verificationStatus === "pending" && (
                            <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(maestro.id);
                                }}
                                disabled={
                                  approveMutation.isPending ||
                                  rejectMutation.isPending
                                }
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                              >
                                <CheckCircle2 size={14} />
                                Aprobar
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReject(maestro.id);
                                }}
                                disabled={
                                  approveMutation.isPending ||
                                  rejectMutation.isPending
                                }
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 gap-2"
                              >
                                <ShieldX size={14} />
                                Rechazar
                              </Button>
                              {(approveMutation.isPending ||
                                rejectMutation.isPending) && (
                                <span className="text-xs text-muted-foreground">
                                  Procesando...
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right: Photo Gallery + ID Document */}
                        <div className="space-y-4">
                          {/* Portfolio Photos */}
                          <div>
                            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2 mb-3">
                              <FileImage size={14} />
                              Portafolio ({maestro.galleryImages?.length ?? 0} fotos)
                            </h4>
                            {maestro.galleryImages &&
                            maestro.galleryImages.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {maestro.galleryImages.map((img, idx) => (
                                  <a
                                    key={img.key || idx}
                                    href={img.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative group aspect-square rounded-lg overflow-hidden border border-border/30 bg-muted"
                                  >
                                    <img
                                      src={img.url}
                                      alt={img.caption || `Foto ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                      <Eye
                                        size={20}
                                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                      />
                                    </div>
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-32 rounded-lg border border-dashed border-border/50 bg-muted/20">
                                <span className="text-xs text-muted-foreground">
                                  Sin fotos de portafolio
                                </span>
                              </div>
                            )}
                          </div>

                          {/* ID Document */}
                          {maestro.idDocumentKey && (
                            <div>
                              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2 mb-3">
                                <ShieldCheck size={14} />
                                Documento de Identidad
                              </h4>
                              <a
                                href={maestro.idDocumentKey}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block relative group aspect-[3/2] max-w-sm rounded-lg overflow-hidden border border-border/30 bg-muted"
                              >
                                <img
                                  src={maestro.idDocumentKey}
                                  alt="Documento de identidad"
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                  <Eye
                                    size={24}
                                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  />
                                </div>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-muted-foreground w-32 shrink-0 text-xs font-medium uppercase tracking-wide pt-0.5">
        {label}
      </span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}
