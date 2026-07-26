/*
 * DESIGN: Artesanía Digital — native multi-step onboarding wizard.
 * Implements audit P3: embedded progressive disclosure with progress bar,
 * Mexican phone validation, and inline error messages.
 * Replaces the Typebot redirect that broke brand continuity.
 */

import { useState } from "react";
import { X, ArrowLeft, ArrowRight, User, Briefcase, MapPin, ShieldCheck, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface OnboardingWizardProps {
  onClose: () => void;
}

const STEPS = [
  { id: 1, label: "Datos Personales", icon: User },
  { id: 2, label: "Tu Oficio", icon: Briefcase },
  { id: 3, label: "Zona de Trabajo", icon: MapPin },
  { id: 4, label: "Sello Maestro", icon: ShieldCheck },
];

const TRADES = ["Plomero", "Electricista", "Albañil", "Herrero", "Yesero", "Pintor", "Pisos", "Gasfitero", "Otro"];
const ZONES = ["Azcapotzalco", "Coyoacán", "Cuajimalpa", "Gustavo A. Madero", "Iztapalapa", "Tlalpan", "Venustiano Carranza", "Benito Juárez", "Nezahualcóyotl", "Ecatepec", "Naucalpan", "Tlalnepantla", "Atizapán"];

export default function OnboardingWizard({ onClose }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    phoneError: "",
    trade: "",
    experience: "",
    workType: "",
    zone: "",
    uploadReady: false,
  });

  const progress = (step / STEPS.length) * 100;

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) return true;
    if (cleaned.length === 12 && cleaned.startsWith("52")) return true;
    if (cleaned.length === 13 && cleaned.startsWith("+52")) return true;
    return false;
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) return `+52 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
    if (cleaned.length === 12 && cleaned.startsWith("52")) return `+52 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
    return phone;
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
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const submit = () => {
    toast.success("¡Registro completado! Revisaremos tus documentos en 24-48 horas.");
    onClose();
  };

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
                      setFormData({
                        ...formData,
                        phone: val,
                        phoneError: val.length === 10 && !validatePhone(val) ? "Número inválido" : "",
                      });
                    }}
                    placeholder="55 1234 5678"
                    className="w-full pl-12 pr-4 py-3 bg-secondary border border-border rounded-xl text-foreground font-mono placeholder:text-muted-foreground/50 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10 outline-none transition-all"
                  />
                </div>
                {formData.phoneError && (
                  <p className="text-xs text-destructive mt-1.5">
                    Ingresa tu número con el código de país, ej: +52 55 1234 5678
                  </p>
                )}
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

          {/* Step 4: Sello Maestro */}
          {step === 4 && (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 bg-gold-badge/10 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck size={32} className="text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Sello Maestro</h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Para obtener el Sello Maestro de verificación, necesitamos validar tu identidad y documentos.
                Sube una foto de tu identificación oficial para continuar.
              </p>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <p className="text-sm font-medium text-foreground mb-2">Sube tu identificación oficial</p>
                <p className="text-xs text-muted-foreground mb-4">
                  INE, Pasaporte o Cédula Profesional
                </p>
                <button
                  onClick={() => {
                    setFormData({ ...formData, uploadReady: true });
                    toast.success("Documento simulado recibido (demo)");
                  }}
                  className={`text-sm font-semibold px-6 py-2.5 rounded-xl transition-all ${
                    formData.uploadReady
                      ? "bg-emerald-brand/10 text-emerald-brand border border-emerald-brand/30"
                      : "bg-secondary text-foreground border border-border hover:border-terracotta/30"
                  }`}
                >
                  {formData.uploadReady ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle size={16} /> Documento recibido
                    </span>
                  ) : (
                    "Seleccionar archivo"
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                La verificación toma entre 24 y 48 horas hábiles
              </p>
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
              className="flex-1 bg-emerald-brand text-white font-semibold py-3 rounded-xl hover:brightness-90 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Completar Registro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
