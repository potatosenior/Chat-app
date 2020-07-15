const users = [];

const addUser = ({id, username, room}) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: "Nome e/ou sala inválido(s)!"
    }
  }

  const existingUser = users.find( user => {
    return user.room === room && user.username === username;
  });

  if (existingUser) {
    return {
      error: "Este nome já está em uso!"
    }
  }

  const user = {id, username, room };
  users.push(user);
  return { user };
}

const removeUser = id => {
  const index = users.findIndex( user => user.id === id );

  if (index !== -1) {
    // existe
    return users.splice(index, 1)[0];
  }
}

const getUser = id => users.find( user => user.id === id );

const getUserInRoom = room => users.filter( user => user.room === room );

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserInRoom
};