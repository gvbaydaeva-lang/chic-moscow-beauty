import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { categories } from "@/data/services";
import { toast } from "@/hooks/use-toast";

interface BookingModalProps {
  trigger: React.ReactNode;
  preselectedServiceId?: string;
}

const BookingModal = ({ trigger, preselectedServiceId }: BookingModalProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    serviceId: preselectedServiceId || "",
    masterId: "",
    date: "",
    time: "",
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const { data: services = [] } = useQuery({
    queryKey: ["public-services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: masters = [] } = useQuery({
    queryKey: ["public-masters"],
    queryFn: async () => {
      const { data, error } = await supabase.from("masters").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const selectedService = services.find(s => s.id === form.serviceId);
  const categoryMasters = selectedService
    ? masters.filter(m => m.specialties?.includes(selectedService.category))
    : masters;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const service = services.find(s => s.id === form.serviceId);
    const master = masters.find(m => m.id === form.masterId);

    const { error } = await supabase.from("appointments").insert({
      client_name: form.name,
      client_phone: form.phone,
      service_id: form.serviceId || null,
      master_id: form.masterId || null,
      service_name: service?.title || "",
      master_name: master?.name || "",
      appointment_date: form.date,
      appointment_time: form.time,
      comment: form.comment || null,
    });

    if (error) {
      toast({ title: "Ошибка", description: "Не удалось отправить заявку", variant: "destructive" });
    } else {
      toast({ title: "Заявка отправлена!", description: "Мы свяжемся с вами для подтверждения записи." });
      setOpen(false);
      setForm({ name: "", phone: "", serviceId: "", masterId: "", date: "", time: "", comment: "" });
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Запись на услугу</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Ваше имя</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-input bg-background px-3 py-2 text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Телефон</label>
            <input type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+7 (___) ___-__-__"
              className="w-full border border-input bg-background px-3 py-2 text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Услуга</label>
            <select required value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value, masterId: "" })}
              className="w-full border border-input bg-background px-3 py-2 text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">Выберите услугу</option>
              {categories.map(cat => {
                const catServices = services.filter(s => s.category === cat.id);
                if (catServices.length === 0) return null;
                return (
                  <optgroup key={cat.id} label={cat.title}>
                    {catServices.map(s => (
                      <option key={s.id} value={s.id}>{s.title} — {s.price.toLocaleString("ru-RU")} ₽</option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Мастер</label>
            <select value={form.masterId} onChange={e => setForm({ ...form, masterId: e.target.value })}
              className="w-full border border-input bg-background px-3 py-2 text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">Любой мастер</option>
              {categoryMasters.map(m => (
                <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Дата</label>
              <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full border border-input bg-background px-3 py-2 text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Время</label>
              <input type="time" required value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                className="w-full border border-input bg-background px-3 py-2 text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Комментарий</label>
            <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} rows={2} placeholder="Пожелания (необязательно)"
              className="w-full border border-input bg-background px-3 py-2 text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full bg-primary text-primary-foreground py-3 text-sm font-medium tracking-wide hover:bg-primary/90 transition-colors rounded-sm disabled:opacity-50">
            {submitting ? "Отправка..." : "Отправить заявку"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
