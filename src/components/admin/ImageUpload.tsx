import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ImageUploadProps {
  folder: string;
  currentUrl: string | null;
  onUpload: (url: string) => void;
}

export const ImageUpload = ({ folder, currentUrl, onUpload }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Файл слишком большой", description: "Максимум 5 МБ", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("salon-images").upload(path, file);
    if (error) {
      toast({ title: "Ошибка загрузки", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("salon-images").getPublicUrl(path);
    onUpload(publicUrl);
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      {currentUrl && (
        <img src={currentUrl} alt="" className="w-24 h-24 rounded-sm object-cover" />
      )}
      <label className="inline-block px-4 py-2 text-sm bg-muted text-muted-foreground rounded-sm cursor-pointer hover:bg-muted/80 transition-colors">
        {uploading ? "Загрузка..." : "Выбрать файл"}
        <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
      </label>
    </div>
  );
};
