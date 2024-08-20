const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/locations', async (req, res) => {
    const data = {
        collection: "Ecuador", 
        database: "Instituciones", 
        dataSource: "Cluster0", 
        filter: {}
    };

    try {
        const mongoResponse = await axios({
            method: 'post',
            url: process.env.MONGO_URL,
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.MONGO_API_KEY,
            },
            data: data
        });

        const locations = mongoResponse.data.documents;
        const weatherPromises = locations.map(async (location) => {
            const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
                params: {
                    lat: location.X,
                    lon: location.Y,
                    appid: process.env.OPENWEATHER_API_KEY,
                    units: 'metric' // o 'imperial' dependiendo de tus preferencias
                }
            });
            location.weather = weatherResponse.data;
            return location;
        });

        const locationsWithWeather = await Promise.all(weatherPromises);
        res.json(locationsWithWeather);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
