export function getFileExtension(filename: string): string | null {
  const parts = filename.split('.');

  // Si le fichier n'a pas d'extension, retourner null
  if (parts.length <= 1) {
    return null;
  }

  return parts[parts.length - 1].toLocaleLowerCase();
}
