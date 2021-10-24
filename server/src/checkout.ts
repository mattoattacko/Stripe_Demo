import { stripe } from './';
import Stripe from 'stripe';

//Purpose
//Create a reuseable function that we can use on our API endpoint

/**
 * Creates a Stripe Checkout session with line items
 */
export async function createStripeCheckoutSession(
  line_items: Stripe.Checkout.SessionCreateParams.LineItem[]
) {
  // Example Item
  // {
  //   name: 'T-shirt',
  //   description: 'Comfortable cotton t-shirt',
  //   images: ['https://example.com/t-shirt.png'],
  //   amount: 500,
  //   currency: 'usd',
  //   quantity: 1,
  // }

  const url = process.env.WEBAPP_URL;

  //creates a checkout session
  //options passed in determine how the session behavies 
  //'line_items' is an array of products the user purchased, coming from FrontEnd
  //success/cancel urls are set as ENVs here, but we can hardcode our website if wanted
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${url}/failed`,
  });

  //tells Stripe to create a session with unique ID that we can use in the FE to show that specific checkout page
  return session;
}
