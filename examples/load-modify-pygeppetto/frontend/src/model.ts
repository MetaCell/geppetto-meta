import { createDraft } from "immer";


export type JsonRefEObject = {
  $ref: (string | null);
  eClass?: (string | null);
};


const resolve_path = (path: (string | number)[], model: Record<string, any>, seen: Record<string, any>) => {
  let obj = model;
  for (const sub of path) {
    obj = obj[sub]
  }
  return obj
}

const eObjectRef  = (object: any): string => {
  return object?.$ref2 || object?.$ref
}

const resolveJsonEObject = (object: JsonRefEObject, root: Record<string, any>, seen: Record<string, any>): any => {
  const ref = eObjectRef(object)
  if (!ref) {
    return undefined
  }
  if (ref in seen) {
    return seen[ref]
  }
  if (ref.includes("/")) {
    const path = ref.replace(/\/@/g, '.').replace("/.", "").split('.')
    const resolved = resolve_path(path, root, seen)
    seen[ref] = resolved
    return resolved
  }
}

const resolve = (value: any, root: any, seen: Record<string, any>): any => {
  if (Array.isArray(value)) {
    const result = []
    for (const e of value) {
      result.push(resolve(e, root, seen))
    }
    return result
  }
  if (eObjectRef(value)) {
    return wrap(resolveJsonEObject(value, root, seen), root)
  }
  if (typeof value === "object" && value !== null) {
    return wrap(value, root)
  }
  return value
}


export const wrap = (data: any, root: any): (any  & { [key: string]: any }) => {
  if (data?.$$wrapped) {
    return data
  }
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== "object" || value === null || key.startsWith("$$")) {
      continue
    }
    const localKey = `$$${key}`
    // data[localKey] = value
    Object.defineProperty(data, key, {
      get: () => {
        if (localKey in data) {
          return data[localKey]
        }
        data[localKey] = value
        const resolved = resolve(value, root, {})
        // data[localKey] = resolved
        return resolved
      },
      set: (value: any) => {
        data[localKey] = value
      },
    });
  }
  data.$$wrapped = true
  return data
}

export const wrapRoot = (data: any):  (any  & { [key: string]: any }) => {
  return wrap(data, data)
}