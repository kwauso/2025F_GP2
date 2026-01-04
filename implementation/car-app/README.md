# Car App

VC Issuer for driving data system.

## Features

- Generates test sensor data at 1-second intervals
- Creates SHA-256 hash chains from sensor data
- Aggregates data into 60-second segments
- Issues Verifiable Credentials for each segment

## Modules

- `sensorDataGenerator.ts`: Generates test sensor data
- `hashChain.ts`: Creates hash chains using deterministic binary encoding
- `aggregator.ts`: Aggregates 60-second segments (avg, max, min)
- `vcIssuer.ts`: Issues Verifiable Credentials
- `index.ts`: Main CarApp class

## Usage

See main README.md for usage examples.

