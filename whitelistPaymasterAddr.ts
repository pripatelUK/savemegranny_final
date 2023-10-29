//BEFORE WE CAN GET OUR SPONSORED TXS THROUGH WE NEED TO WHITELIST WHO CAN BE A BENEFICIARY OF THE PAYMASTER

const main = async () => {
    const addresses = ['0xc8fbF79Aa2A8cf66Cbf6E986287F460cDf300498'];
    const api_key = 'arka_public_key';
    const chainId = 80001;
    const returnedValue = await fetch('https://arka.etherspot.io/whitelist', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "params": [addresses, chainId, api_key] })
    })
        .then((res) => {
            return res.json()
        }).catch((err) => {
            console.log(err);
            // throw new Error(JSON.stringify(err.response))
        });
    console.log('Value returned: ', returnedValue);
}

main()