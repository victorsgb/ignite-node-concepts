const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  
  // Get username from header of request
  const { username } = request.headers;

  // Check if username exists in the 'users' array
  const user = users.find(user => user.username == username);

  if (!user) {
    return response.status(404).json({
        error: 'User not found!'
    });
  }

  request.user = user;

  return next();

}

app.post('/users', (request, response) => {
  // Get name and username from body of request
  const { name, username } = request.body;

  // Ensure name and username are not null
  if (!name || !username) {
    return response.status(403).json({
        error: 'Client did not provide a name and/or username!'
    });
  }

  // Ensure username is unique
  const usernameNotUnique = users.find(user => user.username == username);

  if (usernameNotUnique) {
    return response.status(400).json({
        error: 'Client username already registered in database!'
    });
  }

  // New user object
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  // Store new user in the 'users' array
  users.push(newUser);

  // Return created user
  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // Get user from request
  const { user } = request;

  // Return the 'todos' array from this user object
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Get title and headline from body of request
  const { title, deadline } = request.body;

  // Create todo object
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  // Get user from request
  const { user } = request;

  // Push data as new element of 'todos' array from this user
  user.todos.push(todo);

  // Return todo object
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Get title and headline from body of request
  const { title, deadline } = request.body;

  // Get todo id from params of request
  const { id } = request.params;

  // Get user from request
  let { user } = request;


  // Get proper todo from this user
  let todo = user.todos.find(todo => todo.id == id);

  if (!todo) {
    return response.status(404).json({
      'error': 'Todo not found!'
    });
  }

  // Update this todo from this user
  const todoIndex = user.todos.findIndex(todo => todo.id == id);

  user.todos[todoIndex] = {
    ...todo,
    title,
    deadline
  }

  return response.status(201).json(user.todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Get todo id from params of request
  const { id } = request.params;

  // Get user from request
  let { user } = request;

  // Get proper todo from this user
  let todo = user['todos'].find(todo => todo.id == id);
  
  if (!todo) {
    return response.status(404).json({
      error: 'Todo not found!'
    });
  }

  // Update this todo from this user
  const todoIndex = user.todos.findIndex(todo => todo.id == id);

  user.todos[todoIndex] = {
    ...todo,
    done: true
  };

  return response.status(201).json(user.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Get todo id from params of request
  const { id } = request.params;
  
  // Get user from request
  let { user } = request;

  // Ensure todo to be deleted exists
  const todo = user.todos.find(todo => todo.id == id);

  if (!todo) {
    return response.status(404).json({
      error: 'Todo not found!'
    });
  }

  // Update todos from this user by excluding this todo
  user.todos = user.todos.filter(todo => todo.id != id);

  return response.status(204).json();
});

module.exports = app;