const express = require('express');
const app = express();
const cors = require('cors');
const { config } = require('dotenv');
const configuration = require('./knexfile.js')[process.env.NODE_ENV | 'development']
const database = require('knex')(configuration);
console.log('configuration', configuration) 
const port = process.env.PORT || 10000


app.use(express.json())
app.use(cors())
app.set('port', port)
app.locals.title = 'Stacks'


app.set('port', process.env.PORT);
app.locals.title = 'Stacks';

app.listen(port, () => {
    console.log(`${app.locals.title} is running on port ${port}.`);
})

app.get('/albums', async (request, res) => {
    try {
        const albums = await database('albums').select()
        res.status(200).json(albums) 
    } catch(error) {
        console.error('Database error:', error.message)
        res.status(500).json({error:error.message})
    }
});

app.get('/albums/:id', async (req, res) => {
    try {
        const albums = await database('albums').where('id','=',
            req.params.id).select()
            if(albums.length) {
                res.status(200).json(albums)
            } else {
                res.status(400).json({
                    error:`Could not find album with id ${req.params.id}`
                })
            }
    } catch(error) {
        res.status(500).json({error})
    }
});

app.post('/add-stack', (req, res) => {
    const newAlbum = req.body;
    if (!newAlbum || Object.keys(newAlbum).length === 0) {
        return res.status(400).send({ message: 'Invalid album data' });
    }
    newAlbum.id = `ID-${Math.random().toString(36).substr(2, 9)}`
    app.locals.albums.push(newAlbum);
    res.status(201).send(newAlbum);
});

app.delete('/albums/:id', async (req, res) => {
    const albumId = req.params.id;
    try {
        const deletedRows = await database('albums').where('id', '=', albumId).del()
        if(deletedRows) {
            res.status(204).send()
        } else {
            res.status(404).json({error: `Album with id ${albumId} not found.`})
        }
    } catch(error) {
        res.status(500).json({error:error.message})
    }
})
