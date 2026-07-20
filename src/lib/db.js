import { firestore } from '@/lib/firebase';

/**
 * Firestore access helpers. Every collection in this app is a flat top-level
 * collection scoped by a `userId` field, so reads always start from here.
 */

/** Chainable query over the signed-in user's docs — add .where()/.get() as needed. */
export function userQuery(collectionName, uid) {
  return firestore.collection(collectionName).where('userId', '==', uid);
}

/** Snapshot -> plain objects. The Firestore doc id always wins over any `id` field. */
export function mapDocs(snapshot) {
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
}

/** Fetch all of the user's docs in a collection. */
export async function fetchUserDocs(collectionName, uid) {
  return mapDocs(await userQuery(collectionName, uid).get());
}
