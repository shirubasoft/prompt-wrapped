import { deflate, inflate } from 'pako'

import { wrappedSchema, type WrappedData } from './schema'

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index])
  }
  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

export function encodeWrapped(data: WrappedData): string {
  const valid = wrappedSchema.parse(data)
  const bytes = new TextEncoder().encode(JSON.stringify(valid))
  return toBase64Url(deflate(bytes, { level: 9 }))
}

export function decodeWrapped(encoded: string): WrappedData {
  if (encoded.length > 120_000) {
    throw new Error('This Wrapped payload is too large to open safely.')
  }
  const text = new TextDecoder().decode(inflate(fromBase64Url(encoded)))
  return wrappedSchema.parse(JSON.parse(text))
}

export function readWrappedHash(hash = window.location.hash): WrappedData | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const encoded = params.get('data')
  return encoded ? decodeWrapped(encoded) : null
}

export function wrappedUrl(data: WrappedData, location = window.location): string {
  return `${location.origin}${location.pathname}#data=${encodeWrapped(data)}`
}
