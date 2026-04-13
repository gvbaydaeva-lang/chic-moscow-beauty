
-- Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to notify on new appointment
CREATE OR REPLACE FUNCTION public.notify_new_appointment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text;
  anon_key text;
BEGIN
  supabase_url := current_setting('app.settings.supabase_url', true);
  anon_key := current_setting('app.settings.supabase_anon_key', true);

  IF supabase_url IS NULL OR anon_key IS NULL THEN
    supabase_url := 'https://mrbpfnlovtgothjmdpah.supabase.co';
    anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYnBmbmxvdnRnb3Roam1kcGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5OTQxMTUsImV4cCI6MjA5MTU3MDExNX0.iLaUKeAGvb-daTy_MCxDPCUIeB4L1_IUUyHUHz-ufIw';
  END IF;

  PERFORM extensions.http_post(
    supabase_url || '/functions/v1/telegram-notify',
    jsonb_build_object(
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
    )::text,
    'application/json',
    jsonb_build_object(
      'Authorization', 'Bearer ' || anon_key,
      'Content-Type', 'application/json'
    )
  );

  RETURN NEW;
END;
$$;

-- Function to notify on chat session events
CREATE OR REPLACE FUNCTION public.notify_chat_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text;
  anon_key text;
  notify_type text;
BEGIN
  supabase_url := 'https://mrbpfnlovtgothjmdpah.supabase.co';
  anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYnBmbmxvdnRnb3Roam1kcGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5OTQxMTUsImV4cCI6MjA5MTU3MDExNX0.iLaUKeAGvb-daTy_MCxDPCUIeB4L1_IUUyHUHz-ufIw';

  IF TG_OP = 'INSERT' THEN
    notify_type := 'new_chat_session';
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'operator_requested' AND OLD.status != 'operator_requested' THEN
    notify_type := 'operator_requested';
  ELSE
    RETURN NEW;
  END IF;

  PERFORM extensions.http_post(
    supabase_url || '/functions/v1/telegram-notify',
    jsonb_build_object(
      'type', notify_type,
      'record', jsonb_build_object(
        'client_name', NEW.client_name,
        'client_phone', NEW.client_phone
      )
    )::text,
    'application/json',
    jsonb_build_object(
      'Authorization', 'Bearer ' || anon_key,
      'Content-Type', 'application/json'
    )
  );

  RETURN NEW;
END;
$$;

-- Trigger for new appointments
CREATE TRIGGER on_new_appointment
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_appointment();

-- Trigger for chat session events
CREATE TRIGGER on_chat_session_event
  AFTER INSERT OR UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_chat_session();
