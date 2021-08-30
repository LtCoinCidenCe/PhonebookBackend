const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())
morgan.token('body', function (req, res)
{
  // Token plus JSON.stringify
  // When this returns null, a '-' is shown instead.
  // I don't know how to remove it, but it isn't too ugly for me.
  return req.method === 'POST' ? JSON.stringify(req.body) : null;
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

app.get('/api/persons', (request, response) =>
{
  response.json(persons);
})

app.get('/api/persons/:id', (request, response) =>
{
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id);
  if (person)
    response.json(person);
  else
    response.status(404).end();
})

function getRandomInt(max)
{
  return Math.floor(Math.random() * max);
}

const generateId = () =>
{
  return getRandomInt(60000);
}

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
  if (persons.find(psn => psn.name === body.name))
  {
    // identical name found
    return response.status(400).json({
      error: 'name must be unique'
    })
  }
  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }
  persons = persons.concat(person);
  response.json(person);
})

app.get('/info', (request, response) =>
{
  let message = `<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`;
  response.send(message);
})

app.delete('/api/persons/:id', (request, response) =>
{
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id);
  response.status(204).end();
})

const PORT = process.env.PORT||3001;
app.listen(PORT, () =>
{
  console.log(`Server running on port ${PORT}`);
})
