const express = require('express');
const axios=require ('axios')
const mongoose = require('mongoose');
const Exchange = require('./modules/exchang.js');
const Icon = require('./modules/icon.js');
const app = express();
const port = 3000;
const cors=require('cors')
const apiKey = 'FDAB8705-CEAA-4A23-8A5B-6CC30B8D44D9'



const exchangeDataUrl = 'https://rest.coinapi.io/v1/exchanges';
const exchangeIconUrl = 'https://rest.coinapi.io/v1/exchanges/icons/32';


mongoose.connect('mongodb+srv://amir:8604461434@cluster0.tutp2.mongodb.net/Exchange_data', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  //useFindAndModify: false,
});

app.use(express.json());

app.use(cors()) 

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB successfully!');
});

async function fetchExchangeData() {
    try {
      const response = await axios.get(exchangeDataUrl, {
        headers: {
          'X-CoinAPI-Key': apiKey,
        },
      });
      if(response){
        for(i=0; i<=response.data.length;i++){
            const newExchange=new Exchange({
                exchange_id:response.data[i].exchange_id,
                name:response.data[i].name,
                value:response.data[i].volume_1mth_usd
            })
           
           await newExchange.save()

        }

      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch exchange data:', error);
      return [];
    }
}


  async function fetchExchangeIcons() {
    try {
      const response = await axios.get(exchangeIconUrl, {
        headers: {
          'X-CoinAPI-Key': apiKey,
        },
       // responseType: 'arraybuffer',
      });

    
       if(response){
        for(i=0; i<=response.data.length;i++){
            const newIcon=new Icon({
                exchange_id:response.data[i].exchange_id,
                url:response.data[i].url
            })
           
           await newIcon.save()

        }
       }

      return response.data;
    } catch (error) {
      console.error('Failed to fetch exchange icons:', error);
      return null;
    }
  }


  app.get('/fetch-and-store', async (req, res) => {

    try {
        const exchangeData = await fetchExchangeData();
        const exchangeIcons = await fetchExchangeIcons();

     res.send({message:"fetched data and saved in data base",exchangeData,exchangeIcons})
    } catch (error) {
        console.log("error--->",error)
        res.send ({message:"something went wrong"})
    }

})

app.get('/getdata', async (req, res) => {
    try {
      const results = await Exchange.aggregate([
        {
          $lookup: {
            from: 'icons',
            localField: 'exchange_id',
            foreignField: 'exchange_id',
            as: 'iconData',
          },
        },
        {
          $unwind: '$iconData',
        },
        {
          $project: {
            _id: 0,
            exchange_id:1,
            name: 1,
            value: 1,
            url: '$iconData.url',
          },
        },
      ]);
  
      res.status(201).json({message:"data-fetched",length:results.length,results});
    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });