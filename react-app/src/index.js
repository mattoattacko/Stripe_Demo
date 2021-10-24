import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { FirebaseAppProvider } from 'reactfire';

export const firebaseConfig = {
  apiKey: "AIzaSyAmqeFovCrE1hApx1j07vw_DaQ5Im-0uwc",
  authDomain: "stripe-fireshiptutorial.firebaseapp.com",
  projectId: "stripe-fireshiptutorial",
  storageBucket: "stripe-fireshiptutorial.appspot.com",
  messagingSenderId: "198416918455",
  appId: "1:198416918455:web:a563dbe5a02ff93e732a32"
};

export const stripePromise = loadStripe(
  'pk_test_OKDSvqXf1ehDBRLacTm9DQsT00QoSQbq2h'
);

ReactDOM.render(
  <React.StrictMode>
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <Elements stripe={stripePromise}>
        <App />
      </Elements>
    </FirebaseAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
