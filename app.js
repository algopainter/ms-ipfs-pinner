const express = require('express');
const cors = require('cors');
const axios = require('axios').default;

const app = express();
app.use(cors());
app.use(express.json());

const pinataSecret = process.env.PINATA_SECRET;
const pinataAPIKey = process.env.PINATA_API_KEY;
const pinataEndPoint = process.env.PINATA_ENDPOINT;

const port = process.env.PORT || 3000;

app.post('/', async (req, res) => {
    try {
        const headers = {
            'pinata_api_key': pinataAPIKey,
            'pinata_secret_api_key': pinataSecret,
        };
        const data = {
            pinataMetadata: {
                name: 'Hashly Gwei Item',
                keyvalues: req.body
            },
            pinataContent: req.body,
        }
    
        try {
            console.log(`Pinning a new file`);
            const pinata = await axios.post(pinataEndPoint, data, {
                headers
            });
            console.log(`Content pinned successfully`);
            res.status(200);
            res.send({
                ipfsHash: pinata.data.IpfsHash,
            });
        } catch (e) {
            res.status(409);
            res.send({ error: e.toString(), isError: true })
        }
    } catch (e) {
        res.status(500);
        res.send({ error: e.toString() });
    }
});

app.listen(port, function () {
    console.log('MS IPFS PINNER is ready');
});