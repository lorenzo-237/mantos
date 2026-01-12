export function dateToTimestamp(date: Date): number {
  const timestampInMilliseconds = date.getTime();

  // Convertir en secondes en divisant par 1000
  const timestampInSeconds = Math.floor(timestampInMilliseconds / 1000);

  return timestampInSeconds;
}
