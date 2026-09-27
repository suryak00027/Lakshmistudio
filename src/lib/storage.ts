import { supabase } from './supabase';

export async function uploadImage(
  file: File,
  folder: string
): Promise<string | null> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

  const { error } = await supabase.storage
    .from('studio-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) return null;

  const { data } = supabase.storage.from('studio-images').getPublicUrl(fileName);
  return data.publicUrl;
}
