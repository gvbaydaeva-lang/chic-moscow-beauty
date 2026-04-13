import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/services";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface ServiceForm {
  title: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  image_url: string | null;
}

const emptyForm: ServiceForm = {
  title: "", description: "", price: 0, duration: "", category: "nails", image_url: null,
};

const AdminServices = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ServiceForm>(emptyForm);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase.from("services").update(form).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert({ ...form, sort_order: services.length + 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast({ title: editingId ? "Услуга обновлена" : "Услуга добавлена" });
      resetForm();
    },
    onError: (e) => toast({ title: "Ошибка", description: String(e), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast({ title: "Услуга удалена" });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setForm({ title: s.title, description: s.description, price: s.price, duration: s.duration, category: s.category, image_url: s.image_url });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl">Услуги</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>+ Добавить</Button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-sm p-6 mb-6">
          <h3 className="font-heading text-lg mb-4">{editingId ? "Редактировать" : "Новая услуга"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Название</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Категория</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border border-input bg-background px-3 py-2 text-sm rounded-md h-10">
                {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Цена (₽)</label>
              <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Длительность</label>
              <Input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="1 час" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground mb-1 block">Описание</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-input bg-background px-3 py-2 text-sm rounded-md" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground mb-1 block">Фото</label>
              <ImageUpload folder="services" currentUrl={form.image_url} onUpload={url => setForm({ ...form, image_url: url })} />
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
          {services.map(s => (
            <div key={s.id} className="bg-card border border-border rounded-sm p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {s.image_url && <img src={s.image_url} alt="" className="w-12 h-12 rounded-sm object-cover" />}
                <div>
                  <h4 className="font-medium text-sm">{s.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {categories.find(c => c.id === s.category)?.title} • {s.duration} • {s.price.toLocaleString("ru-RU")} ₽
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(s)} className="text-xs text-primary hover:underline">Ред.</button>
                <button onClick={() => deleteMutation.mutate(s.id)} className="text-xs text-destructive hover:underline">Удалить</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminServices;
