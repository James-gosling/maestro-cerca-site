import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Edit2, ShieldCheck, Star, Camera, Save, X, Plus, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { calculateTier } from "shared/tierUtils";

export default function MiPerfil() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Make sure we have a user
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para ver tu perfil");
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const { data: myProfile, isLoading, refetch } = trpc.maestros.myProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateMutation = trpc.maestros.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Perfil actualizado con éxito (+5 puntos!)");
      setIsEditing(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Error al actualizar el perfil");
    },
  });

  const uploadMutation = trpc.maestros.uploadPhoto.useMutation({
    onError: (err) => toast.error("Error al subir foto: " + err.message),
  });

  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [galleryImages, setGalleryImages] = useState<{url: string; caption: string; key: string}[]>([]);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  useEffect(() => {
    if (myProfile) {
      setBio(myProfile.bio || "");
      setSkills((myProfile.skills as string[]) || [myProfile.trade]);
      setAvatarUrl(myProfile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(myProfile.name)}&background=C46A3A&color=fff`);
      setGalleryImages((myProfile.galleryImages as {url: string; caption: string; key: string}[]) || []);
    }
  }, [myProfile, isEditing]);

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin" />
      </div>
    );
  }

  if (!myProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 text-center">
        <div className="max-w-md">
          <h2 className="text-xl font-bold mb-2">Aún no tienes un perfil de maestro</h2>
          <p className="text-muted-foreground mb-4">Regístrate en Maestro Cerca para ofrecer tus servicios.</p>
          <Link href="/">
            <button className="bg-terracotta text-white px-4 py-2 rounded-xl text-sm font-semibold">Ir al inicio</button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    updateMutation.mutate({
      id: myProfile.id,
      bio,
      skills,
      avatarUrl,
      galleryImages,
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim()) && skills.length < 5) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingAvatar(true);
      const base64 = await fileToBase64(file);
      const res = await uploadMutation.mutateAsync({
        data: base64,
        fileName: file.name,
        contentType: file.type,
      });
      setAvatarUrl(res.url);
      toast.success("Foto de perfil actualizada (S3)");
    } catch (err) {
      // Error handled in mutation
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (galleryImages.length >= 5) {
      toast.error("El portafolio está limitado a 5 fotos.");
      return;
    }
    try {
      setIsUploadingGallery(true);
      const base64 = await fileToBase64(file);
      const res = await uploadMutation.mutateAsync({
        data: base64,
        fileName: file.name,
        contentType: file.type,
      });
      setGalleryImages([...galleryImages, { url: res.url, key: res.key, caption: "Foto de mi trabajo" }]);
      toast.success("Foto agregada al portafolio (S3)");
    } catch (err) {
      // Error handled in mutation
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    const newImages = [...galleryImages];
    newImages.splice(index, 1);
    setGalleryImages(newImages);
  };

  const tierInfo = calculateTier({
    points: myProfile.points || 0,
    referencesCount: myProfile.referencesCount || 0,
    reviewsCount: myProfile.reviewsCount || 0,
    verificationStatus: myProfile.verificationStatus,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={16} /> Volver
            </button>
          </Link>
          <span className="text-sm font-semibold font-serif">Mi Perfil</span>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-sm font-medium text-terracotta">
              <Edit2 size={16} /> Editar
            </button>
          ) : (
            <button onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <X size={16} /> Cancelar
            </button>
          )}
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-secondary ring-4 ring-background shadow-md">
                <img src={isEditing ? avatarUrl : myProfile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(myProfile.name)}&background=C46A3A&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              {isEditing && (
                <div className="mt-3 text-center">
                  <label className="text-xs text-terracotta cursor-pointer font-medium hover:underline flex items-center justify-center gap-1">
                    {isUploadingAvatar ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                    Cambiar foto
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold">{myProfile.name}</h1>
              <p className="text-muted-foreground text-sm">{myProfile.trade} · {myProfile.zone}</p>
              
              <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-white shadow-sm ${tierInfo.badgeColors}`}>
                <ShieldCheck size={14} /> {tierInfo.name}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 ml-1">{myProfile.points || 0} puntos de reputación</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">Sobre mí (Bio)</h3>
              {isEditing ? (
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20"
                  rows={4}
                  placeholder="Escribe un breve resumen de tu experiencia..."
                />
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">{myProfile.bio || "No has añadido una descripción."}</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Habilidades (Tags)</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map(skill => (
                  <span key={skill} className="bg-terracotta/10 text-terracotta text-xs font-medium px-2.5 py-1 rounded-md border border-terracotta/20 flex items-center gap-1">
                    {skill}
                    {isEditing && (
                      <button onClick={() => handleRemoveSkill(skill)} className="hover:text-terracotta-dark">
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && skills.length < 5 && (
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Ej. Instalación LED"
                    className="flex-1 bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  />
                  <button onClick={handleAddSkill} className="bg-secondary text-foreground p-1.5 rounded-lg border border-border hover:bg-muted">
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Dynamic Portfolio Gallery */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Portafolio de Trabajos ({galleryImages.length}/5)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                {galleryImages.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group bg-secondary border border-border">
                    <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                    {isEditing ? (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleRemoveGalleryImage(i)}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] truncate">
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
                
                {isEditing && galleryImages.length < 5 && (
                  <label className="relative aspect-square rounded-xl overflow-hidden bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-terracotta/50 hover:bg-terracotta/5 transition-colors">
                    {isUploadingGallery ? (
                      <Loader2 size={24} className="text-muted-foreground animate-spin mb-2" />
                    ) : (
                      <ImageIcon size={24} className="text-muted-foreground mb-2" />
                    )}
                    <span className="text-xs font-medium text-muted-foreground">Agregar foto</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={handleGalleryUpload}
                      disabled={isUploadingGallery}
                    />
                  </label>
                )}
              </div>
              {galleryImages.length === 0 && !isEditing && (
                <p className="text-sm text-muted-foreground italic">No has subido fotos a tu portafolio.</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-terracotta text-white font-semibold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:bg-terracotta-dark disabled:opacity-50"
              >
                {updateMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                Guardar Cambios
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
