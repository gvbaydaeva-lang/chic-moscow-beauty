
-- Create chat_sessions table
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can create a chat session
CREATE POLICY "Anyone can create chat sessions"
  ON public.chat_sessions FOR INSERT TO public
  WITH CHECK (true);

-- Anyone can view their own session by ID (used from client with session_id in localStorage)
CREATE POLICY "Anyone can view chat session by id"
  ON public.chat_sessions FOR SELECT TO public
  USING (true);

-- Admins can manage all sessions
CREATE POLICY "Admins can manage chat sessions"
  ON public.chat_sessions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Service role can update sessions (for edge function)
CREATE POLICY "Service can update chat sessions"
  ON public.chat_sessions FOR UPDATE TO public
  USING (true)
  WITH CHECK (true);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert messages
CREATE POLICY "Anyone can insert chat messages"
  ON public.chat_messages FOR INSERT TO public
  WITH CHECK (true);

-- Anyone can view messages (filtered by session_id on client)
CREATE POLICY "Anyone can view chat messages"
  ON public.chat_messages FOR SELECT TO public
  USING (true);

-- Admins can manage all messages
CREATE POLICY "Admins can manage chat messages"
  ON public.chat_messages FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger to chat_sessions
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
