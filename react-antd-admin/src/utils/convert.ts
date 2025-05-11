export const excludePropertyFalsy = (obj: object) => {
  return Object.fromEntries(Object.entries(obj).filter(([_key, value]) => value));
};
