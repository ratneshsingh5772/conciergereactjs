import { fetchEventSource } from '@microsoft/fetch-event-source';
import { store } from '../app/store';

const API_URL = 'http://localhost:8081/api';

export const streamMessage = async (
  message: string,
  userId: string,
  onMessage: (chunk: string) => void,
  onError: (err: unknown) => void,
  onFinish: () => void
) => {
  const state = store.getState();
  const token = state.auth.accessToken;

  await fetchEventSource(`${API_URL}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, userId }),
    onmessage(ev) {
      // Assuming the backend sends data in the 'data' field of the event
      // Adjust based on actual backend format. 
      // If it sends raw text chunks, ev.data contains it.
      if (ev.data) {
        onMessage(ev.data);
      }
    },
    onerror(err) {
      onError(err);
      // rethrow to stop retrying if needed, or let it retry
      throw err; 
    },
    onclose() {
      onFinish();
    },
  });
};
