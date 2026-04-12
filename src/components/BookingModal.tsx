import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { services, masters, categories, type ServiceCategory } from "@/data/services";
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
    masterName: "",
    date: "",
    time: "",
  });

  const selectedService = services.find(s => s.id === form.serviceId);
  const categoryMasters = selectedService
    ? masters.filter(m => m.specialties.includes(selectedService.category))
    : masters;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show success toast. DB integration later.
    toast({
      title: "Заявка отправлена!",
      description: "Мы свяжемся с вами для подтверждения записи.",
    });
    setOpen(false);
    setForm({ name: "", phone: "", serviceId: "", masterName: "", date: "", time: "" });
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
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-input bg-background px-3 py-2 text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Телефон</label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+7 (___) ___-__-__"
              className="w-full border border-input bg-background px-3 py-2 text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Услуга</label>
            <select
              required
              value={form.serviceId}
              onChange={e => setForm({ ...form, serviceId: e.target.value, masterName: "" })}
              className="w-full border border-input bg-background px-3 py-2 text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Выберите услугу</option>
              {categories.map(cat => (
                <optgroup key={cat.id} label={cat.title}>
                  {services.filter(s => s.category === cat.id).map(s => (
                    <option key={s.id} value={s.id}>{s.title} — {s.price.toLocaleString("ru-RU")} ₽</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Мастер</label>
            <select
              value={form.masterName}
              onChange={e => setForm({ ...form, masterName: e.target.value })}
              className="w-full border border-input bg-background px-3 py-2 text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Любой мастер</option>
              {categoryMasters.map(m => (
                <option key={m.id} value={m.name}>{m.name} — {m.role}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Дата</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full border border-input bg-background px-3 py-2 text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Время</label>
              <input
                type="time"
                required
                value={form.time}
                onChange={e => setForm({ ...form, time: e.target.value })}
                className="w-full border border-input bg-background px-3 py-2 text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 text-sm font-medium tracking-wide hover:bg-primary/90 transition-colors rounded-sm"
          >
            Отправить заявку
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
