import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as odmModule from './odm.js';

describe('odm schema bootstrap', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes the schema only once per process', async () => {
    const execute = vi.fn(async () => [] as any[]);
    const sql = Object.assign(
      vi.fn((strings: TemplateStringsArray | string, ...values: unknown[]) => {
        execute(strings, values);
        return Promise.resolve([] as any[]);
      }),
      {
        json: vi.fn((value: unknown) => value),
      },
    ) as any;

    vi.spyOn(odmModule, 'getSql').mockReturnValue(sql);

    await odmModule.ensureTables();
    await odmModule.ensureTables();

    expect(execute).toHaveBeenCalledTimes(7);
  });
});
