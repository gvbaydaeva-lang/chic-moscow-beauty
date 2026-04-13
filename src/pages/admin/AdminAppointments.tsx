import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

const statusLabels: Record<string, string> = {
  new: "Новая",
  confirmed: "Подтверждена",
  done: "Выполнена",
  cancelled: "Отменена",
};

const statusColors: Record<string, string> = {
  new: "bg-primary/10 text-primary",
  confirmed: "bg-secondary/30 text-foreground",
  done: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const AdminAppointments = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      toast({ title: `Статус изменён на "${statusLabels[status]}"` });
    },
  });

  const filtered = appointments.filter(a => {
    const matchSearch = !search ||
      a.client_name.toLowerCase().includes(search.toLowerCase()) ||
      a.client_phone.includes(search);
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <h2 className="font-heading text-2xl mb-6">Заявки на запись</h2>

      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          placeholder="Поиск по имени / телефону"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-input bg-background px-3 py-2 text-sm rounded-md"
        >
          <option value="">Все статусы</option>
          {Object.entries(statusLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Загрузка...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">Заявок пока нет</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(apt => (
            <div key={apt.id} className="bg-card border border-border rounded-sm p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{apt.client_name}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-sm ${statusColors[apt.status] || ""}`}>
                      {statusLabels[apt.status] || apt.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {apt.service_name} • Мастер: {apt.master_name || "Любой"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    📅 {apt.appointment_date} в {apt.appointment_time} • 📞 {apt.client_phone}
                  </p>
                  {apt.comment && (
                    <p className="text-sm text-muted-foreground mt-1">💬 {apt.comment}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {apt.status === "new" && (
                    <>
                      <button onClick={() => updateStatus.mutate({ id: apt.id, status: "confirmed" })} className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-sm">Подтвердить</button>
                      <button onClick={() => updateStatus.mutate({ id: apt.id, status: "cancelled" })} className="px-3 py-1.5 text-xs bg-muted text-muted-foreground rounded-sm">Отменить</button>
                    </>
                  )}
                  {apt.status === "confirmed" && (
                    <button onClick={() => updateStatus.mutate({ id: apt.id, status: "done" })} className="px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-sm">Выполнена</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
