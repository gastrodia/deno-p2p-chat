export class DenoKV {
  private kv: Deno.Kv
  private static instance: DenoKV | null = null

  // 私有构造函数，禁止直接 new 实例化
  private constructor(kv: Deno.Kv) {
    this.kv = kv
  }

  static async create(): Promise<Deno.Kv> {
    if (DenoKV.instance) {
      return DenoKV.instance.kv
    }
    const kv = await Deno.openKv()
    DenoKV.instance = new DenoKV(kv)
    return DenoKV.instance.kv
  }
}
