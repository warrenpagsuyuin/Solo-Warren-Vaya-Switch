# Project: Vaya Switch
**Differentiator:** A zero-code, non-custodial "dead man's switch" using native ledger time-predicates instead of structural smart contracts.

We are building a Stellar inheritance tool. 
- The backend will be handled via PHP and Laravel routes.
- The app needs to accept a natural language timeframe, convert it to Unix seconds, and generate a Stellar `CreateClaimableBalance` operation using the `predicateNot` condition.
- Please write clean, commented code and separate the routing logic from the Stellar SDK logic.
