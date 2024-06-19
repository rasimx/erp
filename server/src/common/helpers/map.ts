export default class StrictMap<K, V> extends Map<K, V> implements Map<K, V> {
  get(key: K): V {
    if (!this.has(key)) throw new Error(`Missing value for ${String(key)}`);
    // @ts-expect-error  меняем поведение, чтобы выдавал ошибку, а не undefined
    return super.get(key);
  }
}
