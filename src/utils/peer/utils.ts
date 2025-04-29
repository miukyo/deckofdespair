/**
 * Filter out duplicate items from an array based on their ID
 */
export const filterDuplicates = (arr: any[]) => {
  const uniques = new Map(arr.map((item) => [item.id, item]));
  return Array.from(uniques.values());
};

/**
 * Generate a random lobby code
 */
export const generateLobbyCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
