import camelCase from 'lodash.camelcase';

export function toCamelCase(params: Record<string, unknown>) {
  const camelCaseParams: Record<string, unknown> = {};
  Object.entries(params).forEach(([key, value]) => {
    camelCaseParams[camelCase(key)] = value;
  });
  return camelCaseParams;
}