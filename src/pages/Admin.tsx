import { useState } from "react";
import { services as initialServices, categories, type Service, type ServiceCategory } from "@/data/services";
import { toast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  name: string;
  phone: string;
  serviceName: string;
  masterName: string;
  date: string;
  time: string;
  status: "new" | "confirmed" | "done" | "cancelled";
  createdAt: string;
}

const mockAppointments: Appointment[] = [
  { id: "1", name: "Ирина Козлова", phone: "+7 (999) 111-22-33", serviceName: "Классический маникюр", masterName: "Мария Иванова", date: "2026-04-15", time: "14:00", status: "new", createdAt: "2026-04-12" },
  { id: "2", name: "Светлана Белова", phone: "+7 (999) 444-55-66", serviceName: "Женская стрижка", masterName: "Анна Кузнецова", date: "2026-04-16", time: "11:00", status: "confirmed", createdAt: "2026-04-11" },
  { id: "3", name: "Татьяна Новикова", phone: "+7 (999) 777-88-99", serviceName: "Чистка лица", masterName: "Елена Петрова", date: "2026-04-14", time: "16:00", status: "done", createdAt: "2026-04-10" },
];

const statusLabels: Record<Appointment["status"], string> = {
  new: "Новая",
  confirmed: "Подтверждена",
  done: "Выполнена",
  cancelled: "Отменена",
};

const statusColors: Record<Appointment["status"], string> = {
  new: "bg-primary/10 text-primary",
  confirmed: "bg-secondary/30 text-olive",
  done: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const Admin = () => {
  const [tab, setTab] = useState<"appointments" | "services">("appointments");
  const [appointments, setAppointments] = useState(mockAppointments);
  const [servicesList, setServicesList] = useState<Service[]>(initialServices);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState<Omit<Service, "id">>({
    title: "", description: "", price: 0, duration: "", category: "nails",
  });

  const updateAppointmentStatus = (id: string, status: Appointment["status"]) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    toast({ title: `Статус изменён на "${statusLabels[status]}"` });
  };

  const handleSaveService = () => {
    if (editingService) {
      setServicesList(prev => prev.map(s => s.id === editingService.id ? { ...editingService, ...serviceForm } : s));
      toast({ title: "Услуга обновлена" });
    } else {
      const newService: Service = { id: Date.now().toString(), ...serviceForm };
      setServicesList(prev => [...prev, newService]);
      toast({ title: "Услуга добавлена" });
    }
    setShowServiceForm(false);
    setEditingService(null);
    setServiceForm({ title: "", description: "", price: 0, duration: "", category: "nails" });
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({ title: service.title, description: service.description, price: service.price, duration: service.duration, category: service.category });
    setShowServiceForm(true);
  };

  const handleDeleteService = (id: string) => {
    setServicesList(prev => prev.filter(s => s.id !== id));
    toast({ title: "Услуга удалена" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground text-primary-foreground px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="font-heading text-xl">TERRA — Админ-панель</h1>
          <a href="/" className="text-sm text-primary-foreground/60 hover:text-primary-foreground">← На сайт</a>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setTab("appointments")}
            className={`pb-3 text-sm font-medium tracking-wide transition-colors border-b-2 ${
              tab === "appointments" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Заявки ({appointments.length})
          </button>
          <button
            onClick={() => setTab("services")}
            className={`pb-3 text-sm font-medium tracking-wide transition-colors border-b-2 ${
              tab === "services" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Услуги ({servicesList.length})
          </button>
        </div>

        {/* Appointments */}
        {tab === "appointments" && (
          <div className="space-y-4">
            {appointments.map(apt => (
              <div key={apt.id} className="bg-card border border-border rounded-sm p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{apt.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-sm ${statusColors[apt.status]}`}>
                        {statusLabels[apt.status]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {apt.serviceName} • Мастер: {apt.masterName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      📅 {apt.date} в {apt.time} • 📞 {apt.phone}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {apt.status === "new" && (
                      <>
                        <button onClick={() => updateAppointmentStatus(apt.id, "confirmed")} className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-sm">Подтвердить</button>
                        <button onClick={() => updateAppointmentStatus(apt.id, "cancelled")} className="px-3 py-1.5 text-xs bg-muted text-muted-foreground rounded-sm">Отменить</button>
                      </>
                    )}
                    {apt.status === "confirmed" && (
                      <button onClick={() => updateAppointmentStatus(apt.id, "done")} className="px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-sm">Выполнена</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Services */}
        {tab === "services" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-muted-foreground">Управление каталогом услуг</p>
              <button
                onClick={() => { setShowServiceForm(true); setEditingService(null); setServiceForm({ title: "", description: "", price: 0, duration: "", category: "nails" }); }}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-sm"
              >
                + Добавить услугу
              </button>
            </div>

            {showServiceForm && (
              <div className="bg-card border border-border rounded-sm p-6 mb-6">
                <h3 className="font-heading text-lg mb-4">{editingService ? "Редактировать услугу" : "Новая услуга"}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Название</label>
                    <input value={serviceForm.title} onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })} className="w-full border border-input bg-background px-3 py-2 text-sm rounded-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Категория</label>
                    <select value={serviceForm.category} onChange={e => setServiceForm({ ...serviceForm, category: e.target.value as ServiceCategory })} className="w-full border border-input bg-background px-3 py-2 text-sm rounded-sm">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Цена (₽)</label>
                    <input type="number" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: Number(e.target.value) })} className="w-full border border-input bg-background px-3 py-2 text-sm rounded-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Длительность</label>
                    <input value={serviceForm.duration} onChange={e => setServiceForm({ ...serviceForm, duration: e.target.value })} placeholder="1 час" className="w-full border border-input bg-background px-3 py-2 text-sm rounded-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground mb-1 block">Описание</label>
                    <textarea value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} rows={2} className="w-full border border-input bg-background px-3 py-2 text-sm rounded-sm" />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={handleSaveService} className="px-5 py-2 bg-primary text-primary-foreground text-sm rounded-sm">Сохранить</button>
                  <button onClick={() => { setShowServiceForm(false); setEditingService(null); }} className="px-5 py-2 bg-muted text-muted-foreground text-sm rounded-sm">Отмена</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {servicesList.map(service => (
                <div key={service.id} className="bg-card border border-border rounded-sm p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{service.title}</h4>
                    <p className="text-xs text-muted-foreground">{categories.find(c => c.id === service.category)?.title} • {service.duration} • {service.price.toLocaleString("ru-RU")} ₽</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditService(service)} className="text-xs text-primary hover:underline">Ред.</button>
                    <button onClick={() => handleDeleteService(service.id)} className="text-xs text-destructive hover:underline">Удалить</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
