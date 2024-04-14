export function generateUniqueID() {
  const uniqueID = Math.random().toString(36).substring(2)
  return uniqueID;
}
