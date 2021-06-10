const express = require('express');
const cors = require('cors');
const axios = require('axios').default;
var request = require('request');
const FormData = require('form-data');

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
                keyvalues: {
                    data: JSON.stringify(req.body),
                },
            },
            pinataContent: req.body,
        }

        try {
            console.log(`Pinning a new file`);
            
            const pinata = await axios.post(pinataEndPoint, data, {
                headers
            });

            console.log(`Content pinned successfully`);
            console.log(pinata.data);
            
            res.status(200);
            res.send({
                ipfsHash: pinata.data.IpfsHash,
            });
        } catch (e) {
            console.log(e);
            res.send({ error: e.toString(), isError: true }).status(409);
        }
    } catch (e) {
        console.log(e);
        res.send({ error: e.toString() }).status(500);
    }
});

app.get('/', async (req, res) => {
  try {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    
    console.log(`Getting the file ${req.query.path}`);

    let data = new FormData();
    data.append('file', request(req.query.path));

    const metadata = JSON.stringify({
      name: req.query.name,
      keyvalues: {
        collection: req.query.collection,
        path: req.query.path
      }
    });
    data.append('pinataMetadata', metadata);


    console.log(`Pinning file ${req.query.path}`);
    const result = await axios.post(url, data, {
      maxBodyLength: 'Infinity',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        'pinata_api_key': pinataAPIKey,
        'pinata_secret_api_key': pinataSecret,
      }
    });

    console.log(`Hash ${result.data.IpfsHash}`);

    res.status(200);
    res.send({
      ipfsHash: result.data.IpfsHash,
    });
  } catch (e) {
    console.log(e);
    res.send({ error: e.toString() }).status(500);
  }   
});

app.listen(port, function () {
    console.log('MS IPFS PINNER is ready');
});