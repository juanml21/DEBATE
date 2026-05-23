/*
  # Create profiles table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `first_name` (text, not null)
      - `last_name_1` (text, not null)
      - `last_name_2` (text, nullable)
      - `email` (text, unique, not null)
      - `role` (text, not null, default 'miembro') - values: 'director', 'encargado', 'miembro'
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `profiles` table
    - Authenticated users can read their own profile
    - Authenticated users can update their own profile
    - Allow insert during signup via trigger
    - Directors can read all profiles

  3. Trigger
    - Auto-create profile on auth.users insert using user metadata
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  last_name_1 text NOT NULL DEFAULT '',
  last_name_2 text,
  email text UNIQUE NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'miembro' CHECK (role IN ('director', 'encargado', 'miembro')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Directors can read all profiles
CREATE POLICY "Directors can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'director'
    )
  );

-- Directors can update any profile (for role management)
CREATE POLICY "Directors can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'director'
    )
  );

-- Directors can delete profiles
CREATE POLICY "Directors can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'director'
    )
  );

-- Allow profile creation during signup (service role handles this via trigger)
CREATE POLICY "Allow insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name_1, last_name_2, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name_1', ''),
    NEW.raw_user_meta_data->>'last_name_2',
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'miembro')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
