import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync(new URL('../components/api.js', import.meta.url), 'utf8');
const { Api } = await import(`data:text/javascript,${encodeURIComponent(source)}`);
const fallback = 'Unable to load a historical fact. Please try again.';

test('returns an English historical event with its year over HTTPS', async t => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://history.muffinlabs.com/date');
    assert.ok(options.signal instanceof AbortSignal);
    return { ok: true, json: async () => ({ data: { Events: [
      { year: '1969', text: ' Apollo 12 lands on the Moon. ' },
    ] } }) };
  });
  assert.equal(await Api(), '1969: Apollo 12 lands on the Moon.');
});

test('selects among valid events and skips malformed entries', async t => {
  t.mock.method(Math, 'random', () => 0.99);
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ data: { Events: [
    null, { text: 'Missing year' }, { year: '', text: 'Empty year' },
    { year: '1900', text: 'First event.' }, { year: 2000, text: 'Second event.' },
  ] } }) }));
  assert.equal(await Api(), '2000: Second event.');
});

for (const [name, response] of [
  ['HTTP error', { ok: false, status: 503 }],
  ['invalid JSON', { ok: true, json: async () => { throw new SyntaxError('Invalid JSON'); } }],
  ['empty events', { ok: true, json: async () => ({ data: { Events: [] } }) }],
  ['missing events', { ok: true, json: async () => ({}) }],
  ['null response', { ok: true, json: async () => null }],
]) {
  test(`handles ${name} and allows retry`, async t => {
    t.mock.method(console, 'error', () => {});
    const fetchMock = t.mock.method(globalThis, 'fetch', async () => response);
    assert.equal(await Api(), fallback);
    fetchMock.mock.mockImplementation(async () => ({ ok: true, json: async () => ({ data: {
      Events: [{ year: '1969', text: 'Apollo 12 lands on the Moon.' }],
    } }) }));
    assert.equal(await Api(), '1969: Apollo 12 lands on the Moon.');
  });
}

test('aborts stalled requests after eight seconds', async t => {
  t.mock.method(console, 'error', () => {});
  let abort;
  t.mock.method(globalThis, 'setTimeout', (callback, duration) => {
    assert.equal(duration, 8000);
    abort = callback;
    return 123;
  });
  const clear = t.mock.method(globalThis, 'clearTimeout', () => {});
  t.mock.method(globalThis, 'fetch', (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  }));
  const result = Api();
  abort();
  assert.equal(await result, fallback);
  assert.equal(clear.mock.calls[0].arguments[0], 123);
});
