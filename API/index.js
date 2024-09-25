const express = require('express');
const app = express();
const cors = require('cors');
const { config } = require('dotenv');
const { error } = require('console');
const configuration = require('../knexfile.js')[process.env.NODE_ENV || 'development']
const database = require('knex')(configuration);
console.log('configuration', configuration)
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log(process.env.DATABASE_URL)
console.log('POSTGRES_USER', process.env.POSTRGRES_USER) 
const port = process.env.PORT || 3000

app.get("/", (req, res) => res.send("Express on Vercel"));
app.use(express.json())
app.use(cors({
    origin:'*',
    methods:['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type']
}))
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
    } catch (error) {
        console.error('Database error:', error)
        res.status(500).json({ error: error.message })
    }
});

app.get('/albums/:id', async (req, res) => {
    try {
        const albums = await database('albums').where('id', '=',
            req.params.id).select()
        if (albums.length) {
            res.status(200).json(albums)
        } else {
            res.status(400).json({
                error: `Could not find album with id ${req.params.id}`
            })
        }
    } catch (error) {
        console.error(`Error fetching album with id ${req.params.id}`, error)
        res.status(500).json({ error: error.message })
    }
});

app.post('/add-stack', async (req, res) => {
    const newAlbum = req.body
    if (!newAlbum || !Object.keys(newAlbum).length) {
        return res.status(400).send({message: 'Invalid album data.'})
    }
    try {
        const postedAlbum = await database('albums').insert(newAlbum).returning('*')
        res.status(201).json(postedAlbum[0])
    } catch(error) {
        console.error('Error posting your record :(', error)
        res.status(500).json({error: error.message})
    }
});

app.delete('/albums/:id', async (req, res) => {
    const albumId = req.params.id;
    try {
        const deletedRows = await database('albums').where('id', '=', albumId).del()
        if (deletedRows) {
            res.status(204).send()
        } else {
            res.status(404).json({ error: `Album with id ${albumId} not found.` })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = app 