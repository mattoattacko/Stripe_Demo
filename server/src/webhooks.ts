import { stripe } from './';
import Stripe from 'stripe';
import { db } from './firebase';
import { firestore } from 'firebase-admin';

/**
 * Business logic for specific webhook event types
 */
// key in the object is the name of the event
// value is a function to handle that event
// function takes the event data as its argument (eg: payment intent object)
// This is where we would add fulfillment logic and stuff like sending a confirmation email
const webhookHandlers = {
    'checkout.session.completed': async (data: Stripe.Event.Data) => {
      // Add your business logic here
    },
    'payment_intent.succeeded': async (data: Stripe.PaymentIntent) => {
      // Add your business logic here
    },
    'payment_intent.payment_failed': async (data: Stripe.PaymentIntent) => {
      // Add your business logic here
    },
    'customer.subscription.deleted': async (data: Stripe.Subscription) => {
      const customer = await stripe.customers.retrieve( data.customer as string ) as Stripe.Customer;
      const userId = customer.metadata.firebaseUID;
      const userRef = db.collection('users').doc(userId);

        await userRef
          .update({
            activePlans: firestore.FieldValue.arrayRemove(data.plan.id),
          });
    },
    'customer.subscription.created': async (data: Stripe.Subscription) => {
      const customer = await stripe.customers.retrieve( data.customer as string ) as Stripe.Customer;
      const userId = customer.metadata.firebaseUID;
      const userRef = db.collection('users').doc(userId);

        await userRef
          .update({
            activePlans: firestore.FieldValue.arrayUnion(data.plan.id),
          });
    },
    'invoice.payment_succeeded': async (data: Stripe.Invoice) => {
      // Add your business logic here
    },
    'invoice.payment_failed': async (data: Stripe.Invoice) => {
      
      const customer = await stripe.customers.retrieve( data.customer as string ) as Stripe.Customer;
      const userSnapshot = await db.collection('users').doc(customer.metadata.firebaseUID).get();
      // We need to attach some front end logic to display this to the user
      await userSnapshot.ref.update({ status: 'PAST_DUE' });

    }
}

/**
 * Validate the stripe webhook secret, then call the handler for the event type
 */
//Stripe sends the data from this webhook in the request body
export const handleStripeWebhook = async(req, res) => {
  const sig = req.headers['stripe-signature'];
  // This converts the data into a JS {object} 
  const event = stripe.webhooks.constructEvent(req['rawBody'], sig, process.env.STRIPE_WEBHOOK_SECRET);
  
  try {
    // calls handler on the object by passing it as the key to the object and then calling it like a function with ()
    // we also pass in the data object as the argument to the function
    await webhookHandlers[event.type](event.data.object);
    res.send({received: true});
  } catch (err) {
    console.error(err)
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}

