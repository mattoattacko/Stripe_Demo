import { auth } from './firebase';
const API = 'https://stripe-server-apw6lsu5yq-uc.a.run.app';
// const API = 'http://localhost:3333';
// const API = 'mongodb+srv://mattoattacko:6Z6kgRjB2w.tMA9@cluster0.gn0wy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

/**
 * A helper function to fetch data from your API.
 * It sets the Firebase auth token on the request.
 */
export async function fetchFromAPI(endpointURL, opts) {
  const { method, body } = { method: 'POST', body: null, ...opts };

  // Grabs current user, and if it exists, we get the ID token
  // We use the token in the headers
  const user = auth.currentUser;
  const token = user && (await user.getIdToken());

  const res = await fetch(`${API}/${endpointURL}`, {
    method,
    ...(body && { body: JSON.stringify(body) }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}
