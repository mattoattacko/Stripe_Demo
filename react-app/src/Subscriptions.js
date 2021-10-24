import React, { useState, useEffect, Suspense } from 'react';
import { fetchFromAPI } from './helpers';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useUser, AuthCheck } from 'reactfire';

import { db } from './firebase';
import { SignIn, SignOut } from './Customers';


//listens to data in firestore in realime for the logged in user.
//Takes user as input prop, and sets data as state on the component.

function UserData(props) {

  const [data, setData] = useState({});

  // Subscribe to the user's data in Firestore
  // returns a function that we can call to unsubscribe from this data when the component is destroyed
  // the real time listener is 'onSnapshot'
  // in the callback we set the data on the component
  // anytime firestore document changes, the state of the component will change
  // from useEffect we return a function that calls unsubscribe, which will run when the component is destroyed and kill the subscription with firestore
  useEffect(
    () => {
      const unsubscribe = db.collection('users').doc(props.user.uid).onSnapshot(doc => setData(doc.data()) )
      return () => unsubscribe()
    },
    [props.user]
  )

  return (
    <pre>
      Stripe Customer ID: {data.stripeCustomerId} <br />
      Subscriptions: {JSON.stringify(data.activePlans || [])}
    </pre>
  );
}

function SubscribeToPlan(props) {
  const stripe = useStripe();
  const elements = useElements();
  const user = useUser();

  const [plan, setPlan] = useState();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get current subscriptions on mount
  useEffect(() => {
    getSubscriptions();
  }, [user]);

  // Fetch current subscriptions from the API
  // if(user) is 'if the user is logged in'
  // we set the GET request as state on the component
  const getSubscriptions = async () => {
    if (user) {
      const subs = await fetchFromAPI('subscriptions', { method: 'GET' });
      setSubscriptions(subs);
    }
  };

  // Cancel a subscription
  const cancel = async (id) => {
    setLoading(true);
    await fetchFromAPI('subscriptions/' + id, { method: 'PATCH' });
    alert('canceled!');
    await getSubscriptions();
    setLoading(false);
  };

  // Handle the submission of card details
  const handleSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();

    const cardElement = elements.getElement(CardElement);

    // Create Payment Method
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // Create Subscription on the Server
    const subscription = await fetchFromAPI('subscriptions', {
      body: {
        plan,
        payment_method: paymentMethod.id,
      },
    });

    // The subscription contains an invoice
    // If the invoice's payment succeeded then you're good, 
    // otherwise, the payment intent must be confirmed

    //requires_action is for when the payment needs added authority, like in the EU

    const { latest_invoice } = subscription;

    if (latest_invoice.payment_intent) {
      const { client_secret, status } = latest_invoice.payment_intent;

      if (status === 'requires_action') {
        const { error: confirmationError } = await stripe.confirmCardPayment(
          client_secret
        );
        if (confirmationError) {
          console.error(confirmationError);
          alert('unable to confirm card');
          return;
        }
      }

      // success
      alert('You are subscribed!');
      getSubscriptions();
    }

    setLoading(false);
    setPlan(null);
  };

  return (
    <>
      <h2>Subscriptions</h2>
      <p>
        Here we can subscribe users to recurring plans, process the payment, and sync things with
        Firestore in realtime.
      </p>
      <AuthCheck fallback={<SignIn />}>
        <div className="well">
          <h2>Firestore Data</h2>
          <p>User's data in Firestore.</p>
          {user?.uid && <UserData user={user} />}
        </div>

        <hr />

        <div className="well">
          <h3>Step 1: Choose a Plan</h3>

          <button
            className={
              'btn ' +
              (plan === 'plan_HC2o83JbeowZnP'
                ? 'btn-primary'
                : 'btn-outline-primary')
            }
            onClick={() => setPlan('plan_HC2o83JbeowZnP')}>
            Choose Monthly $25/m
          </button>

          <button
            className={
              'btn ' +
              (plan === 'plan_HD6rlaovzAiM7B'
                ? 'btn-primary'
                : 'btn-outline-primary')
            }
            onClick={() => setPlan('plan_HD6rlaovzAiM7B')}>
            Choose Quarterly $50/q
          </button>

          <p>
            Selected Plan: <strong>{plan}</strong>
          </p>
        </div>
        <hr />

        <form onSubmit={handleSubmit} className="well" hidden={!plan}>
          <h3>Step 2: Submit a Payment Method</h3>
          <p>Collect credit card details</p>
          <p>
            Normal Card: <code>4242424242424242</code>
          </p>
          <p>
            3D Secure Card: <code>4000002500003155</code>
          </p>

          <hr />

          <CardElement />
          <button className="btn btn-success" type="submit" disabled={loading}>
            Subscribe & Pay
          </button>
        </form>

        <div className="well">
          <h3>Manage Current Subscriptions</h3>
          {/* maps over subscriptions array and for each of the subs, we show the next payment amount and when it's due */}
          {/* when button is clicked, will take sub ID and the cancel method to cancel */}
          <div>
            {subscriptions.map((sub) => (
              <div key={sub.id}>
                {sub.id}. Next payment of {sub.plan.amount} due{' '}
                {new Date(sub.current_period_end * 1000).toUTCString()}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => cancel(sub.id)}
                  disabled={loading}>
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="well">
          <SignOut user={user} />
        </div>
      </AuthCheck>
    </>
  );
}

export default function Subscriptions() {
  return (
    <Suspense fallback={'loading user'}>
      <SubscribeToPlan />
    </Suspense>
  );
}
