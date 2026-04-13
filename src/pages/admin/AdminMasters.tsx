import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/services";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface MasterForm {
  name: string;
  role: string;
  specialties: string[];
  experience: string;
  image_url: string | null;
  description: string | null;
}

const emptyForm: MasterForm = {
  name: "", role: "", specialties: [], experience: "", image_url: null, description: null,
};

const AdminMasters = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<MasterForm>(emptyForm);

  const { data: masters = [], isLoading } = useQuery({
    queryKey: ["admin-masters"],
    queryFn: async () => {
      const { data, error } = await supabase.from("masters").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase.from("masters").update(form).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("masters").insert({ ...form, sort_order: masters.length + 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-masters"] });
      toast({ title: editingId ? "Мастер обновлён" : "Мастер добавлен" });
      resetForm();
    },
    onError: (e) => toast({ title: "Ошибка", description: String(e), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("masters").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-masters"] });
      toast({ title: "Мастер удалён" });
    },
  });

  const resetForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };

  const handleEdit = (m: any) => {
    setEditingId(m.id);
    setForm({ name: m.name, role: m.role, specialties: m.specialties || [], experience: m.experience, image_url: m.image_url, description: m.description });
    setShowForm(true);
  };

  const toggleSpecialty = (spec: string) => {
    setForm(prev => ({
      ...prev,
      specialties: prev.specialties.includes(spec)
        ? prev.specialties.filter(s => s !== spec)
        : [...prev.specialties, spec],
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl">Мастера</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>+ Добавить</Button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-sm p-6 mb-6">
          <h3 className="font-heading text-lg mb-4">{editingId ? "Редактировать" : "Новый мастер"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Имя</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Должность</label>
              <Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Топ-стилист" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Опыт</label>
              <Input value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} placeholder="10 лет" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Специализации</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <button key={c.id} type="button" onClick={() => toggleSpecialty(c.id)}
                    className={`px-3 py-1 text-xs rounded-sm border ${form.specialties.includes(c.id) ? "bg-primary text-primary-foreground border-primary" : "border-input text-muted-foreground"}`}
                  >{c.title}</button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground mb-1 block">Описание</label>
              <textarea value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-input bg-background px-3 py-2 text-sm rounded-md" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground mb-1 block">Фото</label>
              <ImageUpload folder="masters" currentUrl={form.image_url} onUpload={url => setForm({ ...form, image_url: url })} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Сохранить</Button>
            <Button variant="outline" onClick={resetForm}>Отмена</Button>
          </div>
        </div>
      )}

      {isLoading ? <p className="text-muted-foreground">Загрузка...</p> : (
        <div className="space-y-3">
          {masters.map(m => (
            <div key={m.id} className="bg-card border border-border rounded-sm p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {m.image_url ? (
                  <img src={m.image_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-heading">
                    {m.name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-sm">{m.name}</h4>
                  <p className="text-xs text-muted-foreground">{m.role} • {m.experience}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(m)} className="text-xs text-primary hover:underline">Ред.</button>
                <button onClick={() => deleteMutation.mutate(m.id)} className="text-xs text-destructive hover:underline">Удалить</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMasters;
