# Verifier App

VP Verifier with policy check for driving data system.

## Features

- Receives Verifiable Presentations
- Resolves DIDs using did:web method
- Verifies VPs and all included VCs
- Evaluates driving data against policy rules
- Returns ACCEPT or REJECT with reasons

## Modules

- `didResolver.ts`: Resolves did:web DIDs to DID documents
- `vpVerifier.ts`: Verifies VPs and VCs using @trustknots/vcknots
- `policyChecker.ts`: Evaluates data against policy rules
- `index.ts`: Main VerifierApp class

## Policy

Default policy checks:
- `maxSpeed`: 80 km/h
- `maxAcceleration`: 3.0 m/s²
- `maxYawRate`: 1.0 rad/s
- `maxSteeringAngle`: 540 degrees

## Usage

See main README.md for usage examples.

