const express = require('express');
const app = express();
const cors = require('cors')
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);


app.use(express.json())
app.use(cors())
const port = process.env.PORT || 3000
app.set('port', port)
app.locals.title = 'Stacks'


app.set('port', process.env.PORT || 3000);
app.locals.title = 'Stacks';

app.listen(port, () => {
    console.log(`${app.locals.title} is running on http://localhost:${port}.`);
})

app.get('/albums', async (request, res) => {
    try {
        const albums = await database('albums').select()
        res.status(200).json(albums) 
    } catch(error) {
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

app.delete('/albums/:id', (req, res) => {
    const albumId = req.params.id;
    albums = albums.filter(album => album.id !== albumId);
    res.status(204).send();
})
