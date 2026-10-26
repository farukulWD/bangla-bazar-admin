type PlainObject = Record<string, unknown>;

const isPlainObject = (value: unknown): value is PlainObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasDirtyFlag = (flag: unknown): boolean => {
  if (flag === true) return true;
  if (Array.isArray(flag)) return flag.some(hasDirtyFlag);
  if (isPlainObject(flag)) return Object.values(flag).some(hasDirtyFlag);
  return false;
};

export const pickDirty = (values: unknown, dirty: unknown): PlainObject => {
  if (!isPlainObject(values) || !isPlainObject(dirty)) return {};

  const result: PlainObject = {};

  for (const [key, flag] of Object.entries(dirty)) {
    if (!hasDirtyFlag(flag)) continue;

    const value = values[key];
    result[key] =
      isPlainObject(value) && isPlainObject(flag)
        ? pickDirty(value, flag)
        : value;
  }

  return result;
};

export const isEmptyPatch = (patch: PlainObject) =>
  Object.keys(patch).length === 0;

export const humanizeKey = (key: string) => {
  const words = key.replace(/_/g, " ").replace(/\s+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};
