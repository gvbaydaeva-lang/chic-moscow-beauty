import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface PromoForm {
  title: string;
  description: string;
  image_url: string | null;
  discount_percent: number | null;
  discount_text: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
}

const emptyForm: PromoForm = {
  title: "", description: "", image_url: null, discount_percent: null, discount_text: null, start_date: null, end_date: null, is_active: true,
};

const AdminPromotions = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PromoForm>(emptyForm);

  const { data: promos = [], isLoading } = useQuery({
    queryKey: ["admin-promotions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase.from("promotions").update(form).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("promotions").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      toast({ title: editingId ? "Акция обновлена" : "Акция добавлена" });
      resetForm();
    },
    onError: (e) => toast({ title: "Ошибка", description: String(e), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("promotions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-promotions"] });
      toast({ title: "Акция удалена" });
    },
  });

  const resetForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      title: p.title, description: p.description, image_url: p.image_url,
      discount_percent: p.discount_percent, discount_text: p.discount_text,
      start_date: p.start_date, end_date: p.end_date, is_active: p.is_active,
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl">Акции</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>+ Добавить</Button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-sm p-6 mb-6">
          <h3 className="font-heading text-lg mb-4">{editingId ? "Редактировать" : "Новая акция"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Заголовок</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Скидка (%)</label>
              <Input type="number" value={form.discount_percent || ""} onChange={e => setForm({ ...form, discount_percent: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Дата начала</label>
              <Input type="date" value={form.start_date || ""} onChange={e => setForm({ ...form, start_date: e.target.value || null })} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Дата окончания</label>
              <Input type="date" value={form.end_date || ""} onChange={e => setForm({ ...form, end_date: e.target.value || null })} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground mb-1 block">Описание</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-input bg-background px-3 py-2 text-sm rounded-md" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-muted-foreground mb-1 block">Баннер</label>
              <ImageUpload folder="promotions" currentUrl={form.image_url} onUpload={url => setForm({ ...form, image_url: url })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} id="active" />
              <label htmlFor="active" className="text-sm">Активна</label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Сохранить</Button>
            <Button variant="outline" onClick={resetForm}>Отмена</Button>
          </div>
        </div>
      )}

      {isLoading ? <p className="text-muted-foreground">Загрузка...</p> : promos.length === 0 ? (
        <p className="text-muted-foreground">Акций пока нет</p>
      ) : (
        <div className="space-y-3">
          {promos.map(p => (
            <div key={p.id} className="bg-card border border-border rounded-sm p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {p.image_url && <img src={p.image_url} alt="" className="w-16 h-12 rounded-sm object-cover" />}
                <div>
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    {p.title}
                    {!p.is_active && <span className="text-xs text-muted-foreground">(неактивна)</span>}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {p.discount_percent && `−${p.discount_percent}%`}
                    {p.start_date && ` • с ${p.start_date}`}
                    {p.end_date && ` по ${p.end_date}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(p)} className="text-xs text-primary hover:underline">Ред.</button>
                <button onClick={() => deleteMutation.mutate(p.id)} className="text-xs text-destructive hover:underline">Удалить</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;
