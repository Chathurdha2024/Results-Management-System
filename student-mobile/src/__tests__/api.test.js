import { apiErrorMessage } from '../api';
import { API_BASE_URL } from '../config';

describe('api.apiErrorMessage (unit tests)', () => {
  it('M-U07: prefers the error message returned by the backend', () => {
    const err = { response: { data: { error: 'Invalid registration number or password' } } };
    expect(apiErrorMessage(err, 'Invalid credentials')).toBe(
      'Invalid registration number or password'
    );
  });

  it('M-U08: explains a network/transport failure (no response at all)', () => {
    const err = new Error('Network Error'); // axios sets no .response
    const msg = apiErrorMessage(err, 'Invalid credentials');
    expect(msg).toContain('Cannot reach the server');
    expect(msg).toContain(API_BASE_URL);
  });

  it('M-U09: falls back to the generic message when the response has no error field', () => {
    const err = { response: { status: 500, data: {} } };
    expect(apiErrorMessage(err, 'Invalid credentials')).toBe('Invalid credentials');
  });
});
