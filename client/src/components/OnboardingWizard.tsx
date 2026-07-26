/*
 * DESIGN: Artesanía Digital — native multi-step onboarding wizard.
 * Implements audit P3: embedded progressive disclosure with progress bar,
 * Mexican phone validation, and inline error messages.
 * Replaces the Typebot redirect that broke brand continuity.
 * 
 * NEW: Step 4 (Portfolio) — real S3 photo uploads for project photos.
 * Step 5 (Sello Maestro) — ID document upload for verification.
 */

import { useState, useRef, useCallback } from "react";
import { X, ArrowLeft, ArrowRight, User, Briefcase, MapPin, Camera, ShieldCheck, CheckCircle, Upload, ImagePlus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface OnboardingWizardProps {
  onClose: () => void;
}

const STEPS = [
  { id: 1, label: "Datos Personales", icon: User },
  { id: 2, label: "Tu Oficio", icon: Briefcase },
  { id: 3, label: "Zona de Trabajo", icon: MapPin },
  { id: 4, label: "Tu Portafolio", icon: Camera },
  { id: 5, label: "Sello Maestro", icon: ShieldCheck },
];

const TRADES = ["Plomero", "Electricista", "Albañil", "Herrero", "Yesero", "Pintor", "Pisos", "Gasfitero", "Otro"];
const ZONES = ["Azcapotzalco", "Coyoacán", "Cuajimalpa", "Gustavo A. Madero", "Iztapalapa", "Tlalpan", "Venustiano Carranza", "Benito Juárez", "Nezahualcóyotl", "Ecatepec", "Naucalpan", "Tlalnepantla", "Atizapán"];

interface PhotoPreview {
  id: string;
  preview: string; // local object URL for preview
  file: File;
  uploadedUrl?: string;
  uploadedKey?: string;
  caption: string;
  uploading: boolean;
  error?: string;
}

export default function OnboardingWizard({ onClose }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    trade: "",
    experience: "",
    workType: "",
    zone: "",
  });

  // Photo state
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ID document state
  const [idDocument, setIdDocument] = useState<PhotoPreview | null>(null);
  const idDocInputRef = useRef<HTMLInputElement>(null);

  const progress = (step / STEPS.length) * 100;

  // tRPC mutations
  const uploadPhotoMutation = trpc.maestros.uploadPhoto.useMutation();
  const registerMutation = trpc.maestros.register.useMutation();

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) return true;
    if (cleaned.length === 12 && cleaned.startsWith("52")) return true;
    return false;
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        toast.error("Por favor ingresa tu nombre completo");
        return;
      }
      if (!validatePhone(formData.phone)) {
        toast.error("Ingresa un número válido de 10 dígitos, ej: 55 1234 5678");
        return;
      }
    }
    if (step === 2) {
      if (!formData.trade) {
        toast.error("Por favor selecciona tu oficio");
        return;
      }
      if (!formData.experience || parseInt(formData.experience) < 1) {
        toast.error("Ingresa al menos 1 año de experiencia");
        return;
      }
    }
    if (step === 3) {
      if (!formData.zone) {
        toast.error("Por favor selecciona tu zona de trabajo");
        return;
      }
    }
    if (step === 4) {
      // Photos are optional — can proceed with empty portfolio
      if (photos.some(p => p.uploading)) {
        toast.error("Espera a que se suban todas las fotos antes de continuar");
        return;
      }
    }
    if (step === 5) {
      // ID document is optional for initial registration
    }
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  const handlePhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Filter by type
    const invalidTypes = files.filter(f => !ACCEPTED_TYPES.includes(f.type));
    if (invalidTypes.length > 0 && files.length === invalidTypes.length) {
      toast.error("Solo se aceptan JPG, PNG o WebP");
      e.target.value = "";
      return;
    }

    // Filter by size
    const oversized = files.filter(f => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      toast.error(`${oversized.length} archivo(s) exceden 5MB. Elige archivos más pequeños.`);
    }

    const validFiles = files.filter(f => ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_FILE_SIZE);
    
    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    // Limit to 5 total
    const remaining = 5 - photos.length;
    const toAdd = validFiles.slice(0, remaining);

    if (toAdd.length < validFiles.length) {
      toast.info(`Solo se pueden subir 5 fotos. Se agregarán las primeras ${remaining}.`);
    }

    const newPhotos: PhotoPreview[] = toAdd.map((file) => ({
      id: crypto.randomUUID(),
      preview: URL.createObjectURL(file),
      file,
      caption: "",
      uploading: false,
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
    e.target.value = "";
  }, [photos.length]);

  const uploadPhoto = useCallback(async (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, uploading: true, error: undefined } : p))
    );

    const photo = photos.find((p) => p.id === photoId);
    if (!photo) return;

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(photo.file);
      });

      const fileName = `photo_${photoId.slice(0, 8)}_${Date.now()}.${photo.file.name.split(".").pop()}`;
      const result = await uploadPhotoMutation.mutateAsync({
        data: base64,
        fileName,
        contentType: photo.file.type,
      });

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId
            ? { ...p, uploadedUrl: result.url, uploadedKey: result.key, uploading: false }
            : p
        )
      );
      toast.success("Foto subida correctamente");
    } catch (err) {
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId ? { ...p, uploading: false, error: "Error al subir" } : p
        )
      );
      toast.error("Error al subir la foto. Intenta de nuevo.");
    }
  }, [photos, uploadPhotoMutation]);

  const uploadIdDocument = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Solo se aceptan imágenes de tu identificación");
      return;
    }

    const preview: PhotoPreview = {
      id: crypto.randomUUID(),
      preview: URL.createObjectURL(file),
      file,
      caption: "Documento de identidad",
      uploading: true,
    };

    setIdDocument(preview);
    e.target.value = "";

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const fileName = `id_${preview.id.slice(0, 8)}_${Date.now()}.${file.name.split(".").pop()}`;
      const result = await uploadPhotoMutation.mutateAsync({
        data: base64,
        fileName,
        contentType: file.type,
      });

      setIdDocument({
        ...preview,
        uploading: false,
        uploadedUrl: result.url,
        uploadedKey: result.key,
      });
      toast.success("Documento recibido. Verificación en 24-48 horas.");
    } catch (err) {
      setIdDocument(null);
      toast.error("Error al subir el documento. Intenta de nuevo.");
    }
  }, [uploadPhotoMutation]);

  const removePhoto = useCallback((photoId: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === photoId);
      if (photo?.preview) URL.revokeObjectURL(photo.preview);
      return prev.filter((p) => p.id !== photoId);
    });
  }, []);

  const updateCaption = useCallback((photoId: string, caption: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, caption } : p))
    );
  }, []);

  const submit = async () => {
    // Upload all pending photos and collect results
    const pendingPhotos = photos.filter((p) => !p.uploadedUrl && !p.uploading);
    const uploadResults: { url: string; key: string; caption: string }[] = [];

    // First, include already-uploaded photos
    photos
      .filter((p) => p.uploadedUrl && p.uploadedKey)
      .forEach((p) => {
        uploadResults.push({
          url: p.uploadedUrl!,
          key: p.uploadedKey!,
          caption: p.caption || `Trabajo de ${formData.trade}`,
        });
      });

    // Upload pending photos one by one
    for (const photo of pendingPhotos) {
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? { ...p, uploading: true, error: undefined } : p))
      );

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(photo.file);
        });

        const fileName = `photo_${photo.id.slice(0, 8)}_${Date.now()}.${photo.file.name.split(".").pop()}`;
        const result = await uploadPhotoMutation.mutateAsync({
          data: base64,
          fileName,
          contentType: photo.file.type,
        });

        uploadResults.push({
          url: result.url,
          key: result.key,
          caption: photo.caption || `Trabajo de ${formData.trade}`,
        });

        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id
              ? { ...p, uploading: false, uploadedUrl: result.url, uploadedKey: result.key }
              : p
          )
        );
      } catch (err) {
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id ? { ...p, uploading: false, error: "Error al subir" } : p
          )
        );
        toast.error(`Error al subir "${photo.caption || "foto"}". Se continuará sin ella.`);
      }
    }

    const galleryImages = uploadResults.length > 0 ? uploadResults : undefined;

    try {
      const result = await registerMutation.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        trade: formData.trade,
        experience: parseInt(formData.experience) || 0,
        workType: formData.workType as "independiente" | "empresa",
        zone: formData.zone,
        galleryImages,
        idDocumentKey: idDocument?.uploadedKey,
      });

      toast.success(`¡Registro completado! ID: ${result.id}. Revisaremos tus fotos en 24-48 horas.`);
      onClose();
    } catch (err) {
      toast.error("Error al completar el registro. Intenta de nuevo.");
    }
  };

  const isSubmitting = registerMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card w-full max-w-lg rounded-2xl overflow-hidden animate-in slide-in-from-bottom duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Cerrar">
            <X size={20} />
          </button>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Paso {step} de {STEPS.length} — {STEPS[step - 1].label}
          </p>
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            className={`text-muted-foreground hover:text-foreground transition-colors ${step === 1 ? "invisible" : ""}`}
            aria-label="Anterior"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-5 pb-4">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          {/* Step 1: Personal Data */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-foreground">¿Cuál es tu nombre?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Usaremos este nombre para tu perfil público
                </p>
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Juan Pérez"
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10 outline-none transition-all"
              />
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Teléfono de contacto</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-mono text-muted-foreground">+52</span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setFormData({ ...formData, phone: val });
                    }}
                    placeholder="55 1234 5678"
                    className="w-full pl-12 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground font-mono placeholder:text-muted-foreground/50 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10 outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Al continuar, aceptas recibir mensajes de clientes potenciales
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Trade */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-foreground">¿Cuál es tu oficio?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Selecciona el oficio en el que más te especializas
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TRADES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFormData({ ...formData, trade: t })}
                    className={`py-3 px-3 rounded-xl text-sm font-medium transition-all border ${
                      formData.trade === t
                        ? "bg-terracotta text-white border-terracotta"
                        : "bg-secondary text-foreground border-border hover:border-terracotta/30"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Años de experiencia</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Ej: 8"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">¿Trabajas por tu cuenta o para una empresa?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFormData({ ...formData, workType: "independiente" })}
                    className={`py-3 rounded-xl text-sm font-medium transition-all border ${
                      formData.workType === "independiente"
                        ? "bg-terracotta text-white border-terracotta"
                        : "bg-secondary text-foreground border-border hover:border-terracotta/30"
                    }`}
                  >
                    Trabajo por mi cuenta
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, workType: "empresa" })}
                    className={`py-3 rounded-xl text-sm font-medium transition-all border ${
                      formData.workType === "empresa"
                        ? "bg-terracotta text-white border-terracotta"
                        : "bg-secondary text-foreground border-border hover:border-terracotta/30"
                    }`}
                  >
                    Trabajo para empresa
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Zone */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-foreground">¿Dónde trabajas?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Selecciona las zonas donde ofreces tus servicios
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {ZONES.map((z) => (
                  <button
                    key={z}
                    onClick={() => setFormData({ ...formData, zone: z })}
                    className={`py-3 px-3 rounded-xl text-sm font-medium transition-all border ${
                      formData.zone === z
                        ? "bg-terracotta text-white border-terracotta"
                        : "bg-secondary text-foreground border-border hover:border-terracotta/30"
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Portfolio / Project Photos */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-foreground">Muestra tu trabajo</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Sube fotos de tus proyectos para que los clientes vean la calidad de tu trabajo
                </p>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
              />

              {/* Upload trigger area */}
              <div
                onClick={() => photos.length < 5 && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                  photos.length >= 5
                    ? "border-muted bg-muted/30 cursor-not-allowed opacity-50"
                    : "border-terracotta/30 bg-terracotta/5 hover:border-terracotta/50 hover:bg-terracotta/10"
                }`}
              >
                <ImagePlus size={32} className={`mx-auto mb-2 ${photos.length >= 5 ? "text-muted-foreground" : "text-terracotta"}`} />
                <p className="text-sm font-medium text-foreground">
                  {photos.length >= 5 ? "Máximo 5 fotos alcanzado" : "Agregar fotos de tu trabajo"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {photos.length}/5 fotos · JPG, PNG · Máx. 5MB cada una
                </p>
              </div>

              {/* Photo grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-secondary border border-border">
                        <img
                          src={photo.preview}
                          alt="Project photo"
                          className="w-full h-full object-cover"
                        />
                        {/* Upload overlay */}
                        {photo.uploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 size={24} className="text-white animate-spin" />
                          </div>
                        )}
                        {/* Error overlay */}
                        {photo.error && (
                          <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                            <p className="text-xs text-white font-medium">Error</p>
                          </div>
                        )}
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <Trash2 size={12} />
                      </button>

                      {/* Caption input */}
                      <input
                        type="text"
                        value={photo.caption}
                        onChange={(e) => updateCaption(photo.id, e.target.value)}
                        placeholder="Descripción..."
                        className="mt-1.5 w-full px-2 py-1 text-xs bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-terracotta/50"
                      />

                      {/* Upload button */}
                      {!photo.uploadedUrl && !photo.uploading && (
                        <button
                          onClick={() => uploadPhoto(photo.id)}
                          className="mt-1.5 w-full py-1.5 bg-terracotta text-white text-xs font-medium rounded-lg hover:bg-terracotta-dark transition-colors flex items-center justify-center gap-1"
                        >
                          <Upload size={12} /> Subir
                        </button>
                      )}
                      {photo.uploadedUrl && (
                        <div className="mt-1.5 flex items-center justify-center gap-1 text-emerald-brand text-xs font-medium">
                          <CheckCircle size={12} /> Subida
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Las fotos aumentan tus posibilidades de ser contratado hasta 3x
              </p>
            </div>
          )}

          {/* Step 5: Sello Maestro (ID Document) */}
          {step === 5 && (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 bg-gold-badge/10 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck size={32} className="text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Sello Maestro</h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Sube una foto de tu identificación oficial para obtener el Sello Maestro de verificación.
              </p>

              <input
                ref={idDocInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={uploadIdDocument}
              />

              {idDocument ? (
                <div className="relative inline-block">
                  <div className="w-48 h-32 rounded-xl overflow-hidden border border-border mx-auto">
                    <img
                      src={idDocument.preview}
                      alt="ID document"
                      className="w-full h-full object-cover"
                    />
                    {idDocument.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 size={24} className="text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  {idDocument.uploadedUrl && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-emerald-brand text-sm font-medium">
                      <CheckCircle size={16} /> Documento verificado
                    </div>
                  )}
                  {!idDocument.uploadedUrl && !idDocument.uploading && (
                    <button
                      onClick={() => idDocInputRef.current?.click()}
                      className="mt-3 text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors"
                    >
                      Reintentar subida
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => idDocInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-secondary border border-border rounded-xl text-foreground hover:border-terracotta/50 transition-colors"
                >
                  <Camera size={18} />
                  <span className="text-sm font-medium">Subir identificación</span>
                </button>
              )}

              <p className="text-xs text-muted-foreground">
                INE, Pasaporte o Cédula Profesional · Verificación en 24-48 horas
              </p>

              {/* Registration summary */}
              <div className="mt-4 bg-secondary/50 rounded-xl p-4 text-left space-y-2">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Resumen de tu registro</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <span className="text-muted-foreground">Nombre:</span>
                  <span className="text-foreground font-medium">{formData.name}</span>
                  <span className="text-muted-foreground">Oficio:</span>
                  <span className="text-foreground font-medium">{formData.trade}</span>
                  <span className="text-muted-foreground">Experiencia:</span>
                  <span className="text-foreground font-medium">{formData.experience} años</span>
                  <span className="text-muted-foreground">Zona:</span>
                  <span className="text-foreground font-medium">{formData.zone}</span>
                  <span className="text-muted-foreground">Fotos:</span>
                  <span className="text-foreground font-medium">{photos.filter(p => p.uploadedUrl).length} subidas</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-2 flex gap-3">
          {step < STEPS.length ? (
            <button
              onClick={nextStep}
              className="flex-1 bg-terracotta text-white font-semibold py-3 rounded-xl hover:bg-terracotta-dark transition-colors active:scale-[0.97] flex items-center justify-center gap-2"
            >
              Continuar
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={isSubmitting}
              className="flex-1 bg-emerald-brand text-white font-semibold py-3 rounded-xl hover:brightness-90 transition-all active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Completar Registro
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
