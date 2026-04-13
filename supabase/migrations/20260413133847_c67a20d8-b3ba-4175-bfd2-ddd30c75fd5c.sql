
-- Drop old functions and recreate with net.http_post (pg_net)
CREATE OR REPLACE FUNCTION public.notify_new_appointment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://mrbpfnlovtgothjmdpah.supabase.co/functions/v1/telegram-notify',
    body := jsonb_build_object(
      'type', 'new_appointment',
      'record', jsonb_build_object(
        'client_name', NEW.client_name,
        'client_phone', NEW.client_phone,
        'service_name', NEW.service_name,
        'master_name', NEW.master_name,
        'appointment_date', NEW.appointment_date,
        'appointment_time', NEW.appointment_time,
        'status', NEW.status
      )
    ),
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYnBmbmxvdnRnb3Roam1kcGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5OTQxMTUsImV4cCI6MjA5MTU3MDExNX0.iLaUKeAGvb-daTy_MCxDPCUIeB4L1_IUUyHUHz-ufIw',
      'Content-Type', 'application/json'
    )
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_chat_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  notify_type text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    notify_type := 'new_chat_session';
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'operator_requested' AND OLD.status != 'operator_requested' THEN
    notify_type := 'operator_requested';
  ELSE
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := 'https://mrbpfnlovtgothjmdpah.supabase.co/functions/v1/telegram-notify',
    body := jsonb_build_object(
      'type', notify_type,
      'record', jsonb_build_object(
        'client_name', NEW.client_name,
        'client_phone', NEW.client_phone
      )
    ),
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYnBmbmxvdnRnb3Roam1kcGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5OTQxMTUsImV4cCI6MjA5MTU3MDExNX0.iLaUKeAGvb-daTy_MCxDPCUIeB4L1_IUUyHUHz-ufIw',
      'Content-Type', 'application/json'
    )
  );
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS on_new_appointment ON public.appointments;
CREATE TRIGGER on_new_appointment
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_appointment();

DROP TRIGGER IF EXISTS on_chat_session_event ON public.chat_sessions;
CREATE TRIGGER on_chat_session_event
  AFTER INSERT OR UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_chat_session();
