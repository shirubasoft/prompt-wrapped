import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'

import { demoWrapped } from '../data/demo'
import { decodeWrapped, encodeWrapped, readWrappedHash, wrappedUrl } from './codec'

describe('Prompt Wrapped URL codec', () => {
  it('round-trips a validated report through zlib and base64url', () => {
    const encoded = encodeWrapped(demoWrapped)

    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(decodeWrapped(encoded)).toEqual(demoWrapped)
  })

  it('reads only the data fragment', () => {
    const encoded = encodeWrapped(demoWrapped)

    expect(readWrappedHash(`#ignored=value&data=${encoded}`)).toEqual(demoWrapped)
    expect(readWrappedHash('#nothing=here')).toBeNull()
  })

  it('keeps the report out of the request URL', () => {
    const location = { origin: 'https://example.test', pathname: '/wrapped/' } as Location
    const url = wrappedUrl(demoWrapped, location)

    expect(url).toMatch(/^https:\/\/example\.test\/wrapped\/#data=/)
    expect(url.split('#')[0]).toBe('https://example.test/wrapped/')
  })

  it('rejects oversized fragments before decoding', () => {
    expect(() => decodeWrapped('a'.repeat(120_001))).toThrow(/too large/i)
  })

  it('decodes the Python collector encoding', () => {
    const script = [
      'import base64,json,sys,zlib',
      'raw=json.dumps(json.loads(sys.argv[1]),ensure_ascii=False,separators=(",",":"),).encode()',
      'print(base64.urlsafe_b64encode(zlib.compress(raw,9)).decode().rstrip("="))',
    ].join(';')
    const encoded = execFileSync('python3', ['-c', script, JSON.stringify(demoWrapped)], { encoding: 'utf8' }).trim()

    expect(decodeWrapped(encoded)).toEqual(demoWrapped)
  })
})
