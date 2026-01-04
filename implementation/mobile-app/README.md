# Mobile App

Wallet / VP Holder for driving data system.

## Features

- Receives Verifiable Credentials from car app
- Stores VCs in JSON file (`data/vcs.json`)
- Verifies received VCs
- Creates Verifiable Presentations from multiple VCs
- Presents VPs to verifier app

## Modules

- `vcStorage.ts`: JSON file-based VC storage
- `vcVerifier.ts`: VC verification using @trustknots/vcknots
- `vpCreator.ts`: VP creation from multiple VCs
- `index.ts`: Main MobileApp class

## Storage

VCs are stored in `data/vcs.json` as a JSON array.

## Usage

See main README.md for usage examples.

