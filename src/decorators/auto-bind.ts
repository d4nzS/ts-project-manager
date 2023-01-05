export function AutoBind(
  _: any,
  _2: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  return {
    get() {
      return descriptor.value.bind(this);
    }
  };
}