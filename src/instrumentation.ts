/**
 * Runs once when the server instance starts, before any request is handled
 * (Next.js guarantees `register` completes first — see instrumentation.js docs).
 *
 * pdf-parse (via its bundled pdfjs-dist) needs browser globals DOMMatrix /
 * ImageData / Path2D that don't exist in Node, and its own internal polyfill
 * (a `require` of @napi-rs/canvas resolved relative to its own bundled file
 * path) is unreliable once Turbopack repackages it as an external module —
 * causing "ReferenceError: DOMMatrix is not defined".
 *
 * Worse, per the ES module spec, a module that throws during evaluation is
 * permanently cached in an "errored" state: every later `import('pdf-parse')`
 * instantly rethrows the same cached error without re-evaluating. So the
 * polyfill must be installed AND pdf-parse must be successfully imported once
 * — here, where both are guaranteed to happen before any route can ever touch
 * pdf-parse — so the module registry caches a working module, not a broken one.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const napiCanvas = await import('@napi-rs/canvas')
  for (const [name, value] of [
    ['DOMMatrix', napiCanvas.DOMMatrix],
    ['ImageData', napiCanvas.ImageData],
    ['Path2D', napiCanvas.Path2D],
  ] as const) {
    if (!(name in globalThis)) {
      Object.defineProperty(globalThis, name, { value, writable: true, configurable: true })
    }
  }

  await import('pdf-parse')
}
