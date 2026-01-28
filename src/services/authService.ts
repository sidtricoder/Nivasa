import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
  createdAt: any;
  lastLoginAt: any;
}

// Sign up with email and password
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update profile with display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Create user document in Firestore
    await createUserDocument(user, { displayName });

    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign in with email and password
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update last login time
    await updateUserDocument(user.uid, {
      lastLoginAt: serverTimestamp(),
    });

    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user document exists, if not create one
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await createUserDocument(user);
    } else {
      // Update last login time
      await updateUserDocument(user.uid, {
        lastLoginAt: serverTimestamp(),
      });
    }

    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Create user document in Firestore
export const createUserDocument = async (
  user: User,
  additionalData?: { displayName?: string }
): Promise<void> => {
  const userRef = doc(db, 'users', user.uid);
  const userData: UserData = {
    uid: user.uid,
    email: user.email,
    displayName: additionalData?.displayName || user.displayName,
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  try {
    await setDoc(userRef, userData);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Get user document from Firestore
export const getUserDocument = async (uid: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Update user document
export const updateUserDocument = async (
  uid: string,
  data: Partial<UserData>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
  } catch (error: any) {
    throw new Error(error.message);
  }
};
