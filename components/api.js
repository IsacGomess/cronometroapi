export const Api = async () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch('https://history.muffinlabs.com/date', {
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`History API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const events = Array.isArray(data?.data?.Events)
      ? data.data.Events.filter(event =>
          event &&
          (typeof event.year === 'string' || typeof event.year === 'number') &&
          String(event.year).trim() !== '' &&
          typeof event.text === 'string' && event.text.trim() !== '')
      : [];
    if (events.length === 0) {
      throw new Error('History API returned no valid events');
    }

    const event = events[Math.floor(Math.random() * events.length)];
    return `${event.year}: ${event.text.trim()}`;
  } catch (error) {
    console.error('Error to search new phrase', error);
    return 'Unable to load a historical fact. Please try again.';
  } finally {
    clearTimeout(timeout);
  }
};
