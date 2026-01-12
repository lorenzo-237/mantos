import { VersionSimple } from '@/interfaces/versions.interface';

export function compareByTimestampDesc(a: VersionSimple, b: VersionSimple) {
  if (a.name < b.name) {
    return 1;
  }

  if (a.name > b.name) {
    return -1;
  }

  if (a.timestamp < b.timestamp) {
    return 1;
  }
  if (a.timestamp > b.timestamp) {
    return -1;
  }

  return 0;
}
