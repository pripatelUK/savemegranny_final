## Save Me Granny - ETHLDN Hackathon 29/10/2023
![Save Me Granny!](smg-screenshot.png)

## Summary

Account abstraction enabled passkey signing adds a biometric shield to wallet recovery, and a simplified wallet UX, **simple enough for non-crypto native guardians.** This is important as the most trusted people in your life are not always crypto-native. The reliance on biotmetric data also results in a vastly superior security flow for wallet recovery (and transacting in general).

Lose access to your wallet? Set your Granny as a guardian, even she can save you now! 

👵🏻 👵🏼 👵🏽 👵🏾 👵🏿 🔒

## Context

**Passkeys** 🗝

The password management landscape has been revolutionised by the introduction of web2 Passkeys. Through cryptographic biometric authentication (e.g. face, fingerprint) [passwords can be elminated](https://www.theguardian.com/technology/2023/may/04/google-rolls-out-passkey-technology-in-beginning-of-the-end-for-passwords) altogether. 🤯 Passkeys are also phishing resistant, as they are related to a website (the site of the dApp)

**Account abstraction** 🧩 

AA allows for different signing schemas as opposed to the one enshrined into the chain. For example in our project we use passkey based signing in place of Ethereum/Flare's default signing schema of ECDSA.

## How our dApp & Wallet works?

* A user follows the sign-up flow to add their guardians by entering their email addresses.
* They then setup the passkey for the wallet, which is stored in the devices' security hardened secure enclave. 🔒
* The user is returned a passphrase which is delivered to the guardians via email. **Note this is not a seed phrase**. If a nefarious actor got a hold of this passphrase it wouldn't matter as they can't trigger wallet recovery as they don't have the biometrics of the guardians.
* To trigger a recovery a guardian pastes the relevant passphrase and then is prompted for their biometric signature using their passkeys.
* Once all guardians have done so you now have access to your wallet again! Yay! 🎉🎉🎉

## Sponsors

### Flare 

#### Social.fi Track
*Most innovative project* & *Best UI/UX:*

Leveraging the AA stack and passkeys we have achieved a superior wallet &/or wallet recovery mechanism aimed at consumers to enable wider adoption of web3. 🤝

Flare Deployment addresses:

[Entrypoint](https://coston2-explorer.flare.network/address/0x36b58F5C1969B7b6591D752ea6F5486D069010AB)
[Authentication](https://coston2-explorer.flare.network/address/0x8198f5d8F8CfFE8f9C413d98a0A55aEB8ab9FbB7)
[AuthenticationAccountFactory](https://coston2-explorer.flare.network/address0x0355B7B8cb128fA5692729Ab3AAa199C1753f726)
[Paymaster](https://coston2-explorer.flare.network/address/0x202CCe504e04bEd6fC0521238dDf04Bc9E8E15aB)
[Paymaster owner](https://coston2-explorer.flare.network/address/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)

### Etherspot
*Best implementation of Etherspot's TransactionKit*:

***We use the react TxKit/Prime SDK to send our transactions from our dApp.

*Best use of Arka Paymaster*:

Our team spent significant time trying to integrate the paymaster, debugging alongside the Etherspot team before release of TxKit 0.6.7. Shoutout to Bloody.eth & Taylor for the assistance. Unfortunately even with the update the initial bug still persists and we have commented out the code necessary to use the paymaster with txkit. We kindly ask to consider all our transactions as sponsored given the circumstances. 🙂

What we had to take out of our code:
`<EtherspotBatches paymaste paymaster={{url: "https://arka.etherspot.io",api_key:"arka_public_key",context: { mode: "sponsor" }}}>`

See `whitelistPaymasterAddr.ts` for proof of our paymaster whitelisting script.

*Best security implementation*:

Passkey based signing is an incredibley secure layer on top of Etherspots guardian/recovery system, and this is why we believe we have the best security implementation.
