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

app.get('/api/persons', (request, response) =>
{
  Person.find({}).then(people =>
  {
    response.json(people);
  })
})

app.get('/api/persons/:id', (request, response, next) =>
{
  Person.findById(request.params.id).then(person =>
  {
    if (person)
      response.json(person);
    else
      response.status(404).end();
  })
    .catch(error => next(error));
})

app.put('/api/persons/:id', (request, response, next) =>
{
  const body = request.body;
  const person = {
    name: body.name,
    number: body.number
  }
  // use runValidators option
  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true })
    .then(updatedPerson =>
    {
      response.json(updatedPerson);
    })
    .catch(error => next(error));
})

// function getRandomInt(max) { return Math.floor(Math.random() * max); }
// const generateId = () => { return getRandomInt(60000); }

app.post('/api/persons', (request, response, next) =>
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
  person.save().then(savedPerson => { response.json(savedPerson) })
    .catch(error => next(error));
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

app.delete('/api/persons/:id', (request, response, next) =>
{
  Person.findByIdAndRemove(request.params.id)
    .then(result =>
    {
      response.status(204).end();
    })
    .catch(error =>
    {
      next(error);
    })
})


const errorHandler = (error, request, response, next) =>
{
  console.error(error.message)
  if (error.name === 'CastError')
  {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError')
  {
    return response.status(400).send({ error: error.message });
  }
  next(error)
}
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
{
  console.log(`Server running on port ${PORT}`);
})
