/**
 * Shared rate-limit contract. The server currently uses its synchronous
 * in-memory guard; this adapter is ready for a Redis client in a multi-node
 * deployment without coupling the browser bundle to a Redis dependency.
 */
export interface RedisCommands {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<unknown>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX: number }): Promise<unknown>;
}

export class RedisRateLimiter {
  constructor(private readonly redis: RedisCommands, private readonly max = 5, private readonly windowSeconds = 900) {}

  async allow(key: string): Promise<boolean> {
    const bucket = `fathi:rate:${key}`;
    const count = await this.redis.incr(bucket);
    if (count === 1) await this.redis.expire(bucket, this.windowSeconds);
    return count <= this.max;
  }

  async reset(key: string): Promise<void> {
    await this.redis.set(`fathi:rate:${key}`, "0", { EX: 1 });
  }
}
