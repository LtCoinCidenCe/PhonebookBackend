require('dotenv').config() // environment variable
const express = require('express')
const morgan = require('morgan')
const Person = require('./db/Person')

const app = express()
app.use(express.json())
app.use(express.static('build'))
morgan.token('body', function (req, res)
{
  // Token plus JSON.stringify
  // When this returns null, a '-' is shown instead.
  // I don't know how to remove it, but it isn't too ugly for me.
  return req.method === 'POST' ? JSON.stringify(req.body) : null;
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

// let persons = [
//   {
//     id: 1,
//     name: "Arto Hellas",
//     number: "040-123456"
//   },
//   {
//     "id": 2,
//     "name": "Ada Lovelace",
//     "number": "39-44-5323523"
//   },
//   {
//     "id": 3,
//     "name": "Dan Abramov",
//     "number": "12-43-234345"
//   },
//   {
//     "id": 4,
//     "name": "Mary Poppendieck",
//     "number": "39-23-6423122"
//   }
// ]

app.get('/api/persons', (request, response) =>
{
  Person.find({}).then(people =>
  {
    response.json(people);
  })
})

app.get('/api/persons/:id', (request, response) =>
{
  Person.findById(request.params.id).then(person =>
  {
    response.json(person);
  })
})

function getRandomInt(max) { return Math.floor(Math.random() * max); }

const generateId = () => { return getRandomInt(60000); }

app.post('/api/persons', (request, response) =>
{
  const body = request.body
  if (!body.name)
  {
    return response.status(400).json({
      error: 'name missing'
    })
  }
  if (!body.number)
  {
    return response.status(400).json({
      error: 'number missing'
    })
  }
  const person = new Person({
    name: body.name,
    number: body.number
  })
  person.save().then(savedPerson => { response.json(savedPerson) });
})

app.get('/info', (request, response) =>
{
  Person.find({}).then(people =>
  {
    let amount = people.length;
    let message = `<p>Phonebook has info for ${amount} people</p><p>${new Date()}</p>`;
    response.send(message);
  })
})

app.delete('/api/persons/:id', (request, response) =>
{
  Person.findByIdAndRemove(request.params.id)
    .then(result =>
    {
      response.status(204).end();
    })
    .catch(error =>
    {
      if (error.name === 'CastError')
      {
        return response.status(400).send({ error: 'malformatted id' })
      }
    })
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
{
  console.log(`Server running on port ${PORT}`);
})
