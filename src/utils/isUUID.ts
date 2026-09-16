type UUID = `${string}-${string}-${string}-${string}-${string}`;

export function isValidUUID(id: string): id is UUID {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
