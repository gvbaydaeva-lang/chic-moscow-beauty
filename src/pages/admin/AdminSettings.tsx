import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const settingsKeys = [
  { key: "address", label: "Адрес" },
  { key: "phone", label: "Телефон" },
  { key: "email", label: "Email" },
  { key: "work_hours", label: "Режим работы" },
  { key: "about_text", label: "Текст «О салоне»", multiline: true },
  { key: "equipment_text", label: "Текст «Оборудование»", multiline: true },
];

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("salon_settings").select("*");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const map: Record<string, string> = {};
    settings.forEach(s => { map[s.key] = s.value; });
    setValues(map);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      for (const { key } of settingsKeys) {
        const existing = settings.find(s => s.key === key);
        const val = values[key] || "";
        if (existing) {
          await supabase.from("salon_settings").update({ value: val }).eq("id", existing.id);
        } else {
          await supabase.from("salon_settings").insert({ key, value: val });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast({ title: "Настройки сохранены" });
    },
    onError: (e) => toast({ title: "Ошибка", description: String(e), variant: "destructive" }),
  });

  if (isLoading) return <p className="text-muted-foreground">Загрузка...</p>;

  return (
    <div>
      <h2 className="font-heading text-2xl mb-6">Настройки салона</h2>
      <div className="bg-card border border-border rounded-sm p-6 space-y-4 max-w-2xl">
        {settingsKeys.map(({ key, label, multiline }) => (
          <div key={key}>
            <label className="text-sm text-muted-foreground mb-1 block">{label}</label>
            {multiline ? (
              <textarea
                value={values[key] || ""}
                onChange={e => setValues({ ...values, [key]: e.target.value })}
                rows={3}
                className="w-full border border-input bg-background px-3 py-2 text-sm rounded-md"
              />
            ) : (
              <Input
                value={values[key] || ""}
                onChange={e => setValues({ ...values, [key]: e.target.value })}
              />
            )}
          </div>
        ))}
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          Сохранить настройки
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
