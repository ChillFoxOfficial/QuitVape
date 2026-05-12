/*
  # Fix mutable search_path on update_updated_at_column function

  1. Security Changes
    - Recreate `public.update_updated_at_column()` with `SET search_path = ''`
    - This prevents search path injection attacks by locking the function
      to only resolve unqualified names via the explicit search_path
    - The function only uses `now()` which is a built-in, so an empty
      search_path is safe and the function will still work correctly
*/

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
SET search_path = '';
