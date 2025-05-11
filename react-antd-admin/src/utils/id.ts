export const generateId = () => {
  return Math.floor(Math.random() * 10) + Date.now().toString();
};
