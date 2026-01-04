# Verifiable Credential-based Driving Data System

This is a complete prototype implementation of a Verifiable Credential (VC) and Verifiable Presentation (VP) based driving data system.

## Architecture

The system consists of three main components:

1. **Car App** - VC Issuer
   - Generates test sensor data (1-second intervals)
   - Creates SHA-256 hash chains
   - Aggregates data into 60-second segments
   - Issues Verifiable Credentials

2. **Mobile App** - Wallet / VP Holder
   - Receives and stores VCs
   - Verifies received VCs
   - Creates Verifiable Presentations from multiple VCs
   - Presents VPs to verifiers

3. **Verifier App** - VP Verifier
   - Receives Verifiable Presentations
   - Resolves DIDs using did:web
   - Verifies VPs and included VCs
   - Evaluates data against policy rules

## Project Structure

```
implementation/
├── car-app/          # Car App (VC Issuer)
├── mobile-app/       # Mobile App (Wallet/VP Holder)
├── verifier-app/     # Verifier App
└── shared/           # Shared type definitions
```

## Data Model

### Sensor Data (1-second samples)
- `timestamp`: Epoch milliseconds
- `speed`: km/h
- `acceleration`: m/s²
- `yawRate`: rad/s
- `steeringAngle`: degrees (°)

### Aggregated Metrics (60-second segments)
For each field (speed, acceleration, yawRate, steeringAngle):
- `avg`: Average value
- `max`: Maximum value
- `min`: Minimum value

### Hash Chain
- `start`: First hash of the segment (hex)
- `end`: Last hash of the segment (hex)

## Hash Chain Algorithm

For each 1-second sample:
```
hash_i = SHA256(
  prevHash (32 bytes) ||
  timestamp (8 bytes, big-endian double) ||
  speed (8 bytes, big-endian double) ||
  acceleration (8 bytes, big-endian double) ||
  yawRate (8 bytes, big-endian double) ||
  steeringAngle (8 bytes, big-endian double)
)
```

All numbers are encoded as IEEE 754 double-precision (64-bit) big-endian format.

## DID Configuration

The system uses `did:web` method. Example:
- `did:web:did.eunos.tech:test`

DID documents should be hosted at:
- `https://did.eunos.tech/.well-known/did.json` (for root)
- `https://did.eunos.tech/test/did.json` (for path-based)

## Setup

### Prerequisites
- Node.js (v18 or later)
- npm or yarn

### Installation

```bash
# Navigate to implementation directory
cd implementation

# Install dependencies for each app
cd car-app && npm install && cd ..
cd mobile-app && npm install && cd ..
cd verifier-app && npm install && cd ..
```

### Build

```bash
# Build each app (from implementation directory)
cd car-app && npm run build && cd ..
cd mobile-app && npm run build && cd ..
cd verifier-app && npm run build && cd ..
```

### Quick Start

```bash
# 1. Install dependencies (see above)
# 2. Build all apps (see above)
# 3. Run the example
cd implementation
npm run example
# or
npx tsx run-example.ts
```

**Note**: This is a prototype implementation. The apps do NOT run as separate services or HTTP servers. They run as a single script that demonstrates the complete flow.

## How to Run

### Running the Example

After building all apps, you can run the example script:

```bash
cd implementation
npm run example
```

This will:
1. Create a Car App instance
2. Generate 60 seconds of test sensor data
3. Issue a Verifiable Credential (VC)
4. Send the VC to Mobile App
5. Create a Verifiable Presentation (VP) from stored VCs
6. Present the VP to Verifier App
7. Display verification results

**Output**: The script prints the complete flow with verification results.

### Important Note

**This is NOT a server application**. The apps do not:
- Start HTTP servers
- Run as background services
- Provide REST APIs
- Have a GUI

Instead, it's a **prototype that runs as a single script** demonstrating the VC/VP flow using function calls.

## Usage

### Car App

```typescript
import { CarApp } from './car-app';

const carApp = new CarApp(
  'did:web:did.eunos.tech:test',
  'issuer-private-key'
);

// Process 60 seconds of data and issue VC
const vc = await carApp.processSegmentAndIssueVC(Date.now());

// Send VC to mobile app
await carApp.sendVCToMobile(vc, mobileApp);
```

### Mobile App

```typescript
import { MobileApp } from './mobile-app';

const mobileApp = new MobileApp(
  'did:web:did.eunos.tech:test',
  'holder-private-key'
);

// Receive VC from car app (called by car app)
await mobileApp.receiveVC(vc);

// Create VP from stored VCs
const vp = await mobileApp.createVP();

// Present VP to verifier
const result = await mobileApp.presentVPToVerifier(vp, verifierApp);
```

### Verifier App

```typescript
import { VerifierApp } from './verifier-app';

const verifierApp = new VerifierApp({
  maxSpeed: 80,        // km/h
  maxAcceleration: 3.0 // m/s²
});

// Verify VP
const result = await verifierApp.verifyVP(vp);
console.log(result.accepted); // true or false
console.log(result.reasons);  // Array of reasons
```

## Policy Configuration

Default policy values:
- `maxSpeed`: 80 km/h
- `maxAcceleration`: 3.0 m/s²
- `maxYawRate`: 1.0 rad/s
- `maxSteeringAngle`: 540 degrees

## Usage Guide

### Basic Workflow

1. **Car App issues VC**
   ```typescript
   const carApp = new CarApp(issuerDID, issuerPrivateKey);
   const vc = await carApp.processSegmentAndIssueVC(Date.now());
   ```

2. **Car App sends VC to Mobile App**
   ```typescript
   await carApp.sendVCToMobile(vc, mobileApp);
   ```

3. **Mobile App creates VP**
   ```typescript
   const vp = await mobileApp.createVP();
   ```

4. **Mobile App presents VP to Verifier**
   ```typescript
   const result = await mobileApp.presentVPToVerifier(vp, verifierApp);
   ```

### Running the Example

1. Edit `example.ts` and uncomment the last line:
   ```typescript
   main().catch(console.error);
   ```

2. Run with tsx (or compile first):
   ```bash
   npx tsx example.ts
   ```

   Or compile and run:
   ```bash
   # Compile example.ts (add tsconfig.json at root if needed)
   npx tsc example.ts --outDir dist --module commonjs --target ES2020
   node dist/example.js
   ```

## Important Notes and Warnings

### ⚠️ Critical Limitations

1. **VC/VP Signing and Verification are Placeholders**
   - Current implementation does NOT actually sign VCs or VPs
   - `vcIssuer.ts`, `vcVerifier.ts`, `vpCreator.ts`, `vpVerifier.ts` use placeholder implementations
   - **VCs and VPs are NOT cryptographically signed** - they are only structure-validated
   - For production use, integrate actual `@trustknots/vcknots` API or another VC/VP library

2. **Key Management**
   - Private keys are passed as plain strings (NOT secure)
   - No key generation, storage, or management is implemented
   - **Do NOT use real private keys in this prototype**

3. **DID Resolution**
   - DID documents must be hosted and accessible via HTTP
   - Example: `did:web:did.eunos.tech:test` resolves to `https://did.eunos.tech/test/did.json`
   - If DID resolution fails, verification will fail

4. **Communication Method**
   - Uses function calls (not HTTP/WebSocket)
   - All apps must run in the same process
   - No authentication or secure channel between apps

5. **Data Storage**
   - VCs are stored in `mobile-app/data/vcs.json` (plain JSON file)
   - No encryption or access control
   - File is created automatically on first VC storage

### Implementation Details

- **Test Data**: Sensor data is randomly generated (not from real sensors)
- **Hash Chain**: Uses SHA-256 with deterministic binary encoding (IEEE 754 double-precision, big-endian)
- **Segmentation**: Fixed 60-second segments (exactly 60 samples)
- **Aggregation**: Computes avg, max, min for each field (speed, acceleration, yawRate, steeringAngle)

### Known Issues

- VC verification always returns `true` (placeholder)
- VP verification only checks structure, not signatures
- No error handling for network failures (DID resolution)
- No validation of DID document structure
- Policy checker only validates aggregated metrics, not individual samples

## TODO

- [ ] Integrate actual `@trustknots/vcknots` API for VC/VP signing and verification
- [ ] Add support for loading sensor data from JSON files (1 hour of data)
- [ ] Implement proper key management
- [ ] Add error handling and logging
- [ ] Add unit tests
- [ ] Implement secure communication channel between apps
- [ ] Add DID document validation

