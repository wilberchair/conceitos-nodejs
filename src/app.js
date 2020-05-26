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

  const repository = {id: uuid(), title, url, techs, likes: 0};

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  const projectIndex = repositories.findIndex((project) => project.id === id);
  if (projectIndex < 0) {
    return response.status(400).json({ error: "repository wasn't found" });
  }

  title ? (repositories[projectIndex].title = title) : title;
  url ? (repositories[projectIndex].url = url) : url;
  techs ? (repositories[projectIndex].techs = techs) : techs;

  return response.json(repositories[projectIndex]);
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

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0) {
    return res.status(400).json({ error: "repository wasn't found" });
  }

  repositories[repositoryIndex].likes += 1;
  
  return response.json(repositories[repositoryIndex]);
});

module.exports = app;