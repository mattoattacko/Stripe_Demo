import React, { useState, useEffect, Suspense } from 'react';
import { fetchFromAPI } from './helpers';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useUser, AuthCheck } from 'reactfire';
import firebase from 'firebase/app';

import { auth, db } from './firebase';

export function SignIn() {
  const signIn = async () => {
    // signInWithPopup is how we sign users in to Firebase
    const credential = await auth.signInWithPopup(
      new firebase.auth.GoogleAuthProvider()
    );
    const { uid, email } = credential.user;
    // We use this 'credential' to make a reference to the 'users' collection in the DB, and then set a document with the same user ID and then set the users email address.
    db.collection('users').doc(uid).set({ email }, { merge: true });
  };

  return (
    <button className="btn btn-primary" onClick={signIn}>
      Sign In with Google
    </button>
  );
}

export function SignOut(props) {
  return props.user && (

      <button className="btn btn-outline-secondary" onClick={() => auth.signOut()}>
        Sign Out User {props.user.uid}
      </button>
  );
}

function SaveCard(props) {
  const stripe = useStripe();
  const elements = useElements();
  const user = useUser();

  const [setupIntent, setSetupIntent] = useState();
  const [wallet, setWallet] = useState([]);

  // Get the user's wallet on mount or if the user data changes
  useEffect(() => {
    getWallet();
  }, [user]);

  // Create the setup intent
  //new credit card attach to account = bind this to onClick event handler button
  const createSetupIntent = async (event) => {
    const si = await fetchFromAPI('wallet');
    setSetupIntent(si);
  };

  // Handle the submission of card details
  const handleSubmit = async (event) => {
    event.preventDefault();

    const cardElement = elements.getElement(CardElement);

    // Confirm Card Setup
    const {
      setupIntent: updatedSetupIntent,
      error,
    } = await stripe.confirmCardSetup(setupIntent.client_secret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      alert(error.message);
      console.log(error);
    } else {
      setSetupIntent(updatedSetupIntent);
      await getWallet();
      alert('Success! Card added to your wallet');
    }
  };

  // When the AuthCheck component is first rendered we want to fetch the users wallet from our API
  const getWallet = async () => {
    if (user) {
      const paymentMethods = await fetchFromAPI('wallet', { method: 'GET' });
      setWallet(paymentMethods);
    }
  };

  return (
    <>
      <h2>Customers</h2>

      <p>
        Save credit card details for future use. Connect a Stripe Customer ID to
        a Firebase User ID.
      </p>
    
      {/* AuthCheck will only render the children in this component when the user is logged in. Else falls back to our SignIn component */}
      <AuthCheck fallback={<SignIn />}>
        <div className="well">
          <h3>Step 1: Create a Setup Intent</h3>

          <button
            className="btn btn-success"
            onClick={createSetupIntent}
            hidden={setupIntent}>
            Attach New Credit Card
          </button>
        </div>
        <hr />

        <form
          onSubmit={handleSubmit}
          className="well"
          hidden={!setupIntent || setupIntent.status === 'succeeded'}>
          <h3>Step 2: Submit a Payment Method</h3>
          <p>Collect credit card details, then attach the payment source.</p>
          <p>
            Normal Card: <code>4242424242424242</code>
          </p>
          <p>
            3D Secure Card: <code>4000002500003155</code>
          </p>

          <hr />

          <CardElement />
          <button className="btn btn-success" type="submit">
            Attach
          </button>
        </form>

        <div className="well">
          <h3>Retrieve all Payment Sources</h3>
          <select className="form-control">
            {wallet.map((paymentSource) => (
              <CreditCard key={paymentSource.id} card={paymentSource.card} /> //shows the CC
            ))}
          </select>
        </div>
        <div className="well">
          <SignOut user={user} />
        </div>
      </AuthCheck>
    </>
  );
}

function CreditCard(props) {
  const { last4, brand, exp_month, exp_year } = props.card;
  return (
    <option>
      {brand} **** **** **** {last4} expires {exp_month}/{exp_year}
    </option>
  );
}

export default function Customers() {
  return (
    <Suspense fallback={'loading user'}>
      <SaveCard />
    </Suspense>
  );
}
