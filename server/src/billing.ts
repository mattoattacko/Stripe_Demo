import { stripe } from './';
import { db } from './firebase';
import Stripe from 'stripe';
import { getOrCreateCustomer } from './customers';
import { firestore } from 'firebase-admin';

/**
 * Attaches a payment method to the Stripe customer,
 * subscribes to a Stripe plan, and saves the plan to Firestore
 */
export async function createSubscription(
  userId: string,
  plan: string,
  payment_method: string
) {
  const customer = await getOrCreateCustomer(userId); //gets the customerID

  // Attach the  payment method to the customer
  await stripe.paymentMethods.attach(payment_method, { customer: customer.id });

  // Set it as the default payment method
  await stripe.customers.update(customer.id, {
    invoice_settings: { default_payment_method: payment_method },
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ plan }],
    expand: ['latest_invoice.payment_intent'],
  });

  // 'as' casts these to corresponding strong types
  const invoice = subscription.latest_invoice as Stripe.Invoice;
  const payment_intent = invoice.payment_intent as Stripe.PaymentIntent;

  // Checks and updates the user's status
  // Updates firestore with the users subscription plan
  // 'merge: true' makes it a non-descrutive write (wont delete existing document data)
  if (payment_intent.status === 'succeeded') {
    await db
      .collection('users')
      .doc(userId)
      .set(
        {
          stripeCustomerId: customer.id,
          activePlans: firestore.FieldValue.arrayUnion(plan),
        },
        { merge: true }
      );
  }

  return subscription;
}

/**
 * Cancels an active subscription, syncs the data in Firestore
 */
export async function cancelSubscription(
  userId: string,
  subscriptionId: string
) {
  //next few lines ensure that one user cant cancel another users plan
  const customer = await getOrCreateCustomer(userId);
  if (customer.metadata.firebaseUID !== userId) {
    throw Error('Firebase UID does not match Stripe Customer');
  }
  // This will immediately cancel the subscription
  const subscription = await stripe.subscriptions.del(subscriptionId);

  // Cancel at end of period
  // Would need to set up a webHook to listen to the actual event of when the sub expires, and then update the customer's record
  // const subscription = stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });

  if (subscription.status === 'canceled') {
    await db
      .collection('users')
      .doc(userId)
      .update({
        activePlans: firestore.FieldValue.arrayRemove(subscription.plan.id),
      });
  }

  return subscription;
}

/**
 * Returns all the subscriptions linked to a Firebase userID in Stripe
 */
export async function listSubscriptions(userId: string) {
  const customer = await getOrCreateCustomer(userId);
  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id,
  });

  return subscriptions;
};
