const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const heroes = require('./seed/heroes');

const port = process.argv.slice(2)[0];
const app = express();
app.use(bodyParser.json());

const powers = [
  { id: 1, name: 'flying' },
  { id: 2, name: 'teleporting' },
  { id: 3, name: 'super strength' },
  { id: 4, name: 'clairvoyance' },
  { id: 5, name: 'mind reading' },
];

mongoose.connect('mongodb://db:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: to db - test'));
db.once('open', function () {
  console.log('connected to db - test');
});

const HeroesSchema = new mongoose.Schema({
  id: Number,
  type: String,
  displayName: String,
  powers: Array,
  img: String,
  busy: Boolean,
});

const HeroesModel = mongoose.model('Heroes', HeroesSchema);

app.get('/heroes/seed', (req, res) => {
  HeroesModel.insertMany(heroes, (err, docsHeroes) => {
    res.send(docsHeroes);
  });
});

app.get('/heroes/clean', async (req, res) => {
  const resp = await HeroesModel.remove({});
  res.send(resp);
});

app.get('/heroes/:id', (req, res) => {
  console.log('Returning heroes id');
  res.send(req.params.id);
});

app.get('/heroes', (req, res) => {
  console.log('Returning heroes list');
  HeroesModel.find(function (err, heroes) {
    if (err) return console.error(err);
    res.send(heroes);
  });
  // res.send(heroes);
});

app.get('/powers', (req, res) => {
  console.log('Returning powers list');
  res.send(powers);
});

app.post('/hero/**', (req, res) => {
  const heroId = parseInt(req.params[0]);
  const foundHero = heroes.find((subject) => subject.id === heroId);

  if (foundHero) {
    for (let attribute in foundHero) {
      if (req.body[attribute]) {
        foundHero[attribute] = req.body[attribute];
        console.log(
          `Set ${attribute} to ${req.body[attribute]} in hero: ${heroId}`
        );
      }
    }
    res
      .status(202)
      .header({ Location: `http://localhost:${port}/hero/${foundHero.id}` })
      .send(foundHero);
  } else {
    console.log(`Hero not found.`);
    res.status(404).send();
  }
});

app.use('/img', express.static(path.join(__dirname, 'img')));

console.log(`Heroes service listening on port ${port}`);
app.listen(port);
