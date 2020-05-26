const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

//middleware
function logRequests(request, response, next) {
  const {method, url} = request;

  const logLabel  = `[${method.toUpperCase()}] ${url}`;

  console.time(logLabel);

  next();

  console.timeEnd(logLabel);
}

function validateRepoId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ error: 'invalid repositorie ID.' })
  }

  return next();
}

app.use('/repositories/:id', validateRepoId);

app.get("/repositories", logRequests, (request, response) => {
  const { repos } = request.query;

  const results = repos
    ? repositories.filter(repository => repository.repos.includes(repos))
    : repositories;
  
  return response.json(results);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs} = request.body;

  const repository = {id: uuid(), title, url, techs};

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { title, url, techs} = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  }

  repositories.push(repository);

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repoIndex = repositories.findIndex(repository => repository.id === id);

  if (repoIndex < 0) {
    return response.status(400).json( { error: 'Repository not found.' } )
  }

  repositories.splice(repoIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repository = repositories.find(repository => repository.id === id);

  if (!repository) {
    return response.status(400).send();
  }

  repository.likes += 1;

  return response.json(repository);
});

app.listen(3336, () => {
  console.log('🚀Back-end started!');
});

module.exports = app;
