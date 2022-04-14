import React from 'react';

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import { Checkout, CheckoutSuccess, CheckoutFail } from './Checkout';
import Payments from './Payments';
import Customers from './Customers';
import Subscriptions from './Subscriptions';

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul className="navbar-nav">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/checkout">
                <span aria-label="emoji" role="img">
                  🛒
                </span>{' '}
                Checkout
              </Link>
            </li>
            <li>
              <Link to="/payments">
                <span aria-label="emoji" role="img">
                  💸
                </span>{' '}
                Payments
              </Link>
            </li>
            <li>
              <Link to="/customers">
                <span aria-label="emoji" role="img">
                  🧑🏿‍🤝‍🧑🏻
                </span>{' '}
                Customers
              </Link>
            </li>
            <li>
              <Link to="/subscriptions">
                <span aria-label="emoji" role="img">
                  🔄
                </span>{' '}
                Subscriptions
              </Link>
            </li>
          </ul>
        </nav>

        <main>
          <Switch>
            <Route path="/checkout">
              <Checkout />
            </Route>
            <Route path="/payments">
              <Payments />
            </Route>
            <Route path="/customers">
              <Customers />
            </Route>
            <Route path="/subscriptions">
              <Subscriptions />
            </Route>
            <Route path="/success">
              <CheckoutSuccess />
            </Route>
            <Route path="/failed">
              <CheckoutFail />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <>
      <div class="well">
        <h2>Stripe - React - Node.js || Template</h2>
      </div>

      <div class="embed-responsive embed-responsive-16by9 vid">
        <iframe
          src="https://www.matthewmcquain.com/"
          // width="640"
          // height="360"
          frameborder="0"
          allow="autoplay; fullscreen"
          allowfullscreen>
        </iframe>
      </div>

      <div class="well">
        <h2>Running in Test Mode</h2>
        <p>
          Demo is running in Stripe test mode. Feel free to submit
          payments with testing cards.
        </p>
        <a class="btn btn-outline-success"  href="https://www.upwork.com/freelancers/~01f6206ecf6bf14e26">
            UpWork Profile
          </a>
          <a class="btn btn-secondary" href="https://github.com/mattoattacko">
            Github Profile
          </a>
      </div>
    </>
  );
}

export default App;
