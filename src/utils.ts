export const isEmpty = (value: unknown): boolean => {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (isObject(value) && Object.keys(value).length === 0)
  );
};

export const isObject = (value: unknown): value is object => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const isString = (value: unknown): value is string => {
  return typeof value === "string";
};
