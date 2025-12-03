// Cake service - Business logic layer

// Mock data for now - replace with actual database calls
let cakes = [
  {
    id: 1,
    name: 'Chocolate Cake',
    description: 'Delicious chocolate cake',
    price: 25.99,
    image: 'chocolate-cake.jpg'
  },
  {
    id: 2,
    name: 'Vanilla Cake',
    description: 'Classic vanilla cake',
    price: 20.99,
    image: 'vanilla-cake.jpg'
  }
];

exports.getAllCakes = async () => {
  // TODO: Replace with database query
  return cakes;
};

exports.getCakeById = async (id) => {
  // TODO: Replace with database query
  return cakes.find(cake => cake.id === parseInt(id));
};

exports.createCake = async (cakeData) => {
  // TODO: Replace with database insert
  const newCake = {
    id: cakes.length + 1,
    ...cakeData
  };
  cakes.push(newCake);
  return newCake;
};

exports.updateCake = async (id, cakeData) => {
  // TODO: Replace with database update
  const index = cakes.findIndex(cake => cake.id === parseInt(id));
  if (index === -1) return null;
  
  cakes[index] = { ...cakes[index], ...cakeData };
  return cakes[index];
};

exports.deleteCake = async (id) => {
  // TODO: Replace with database delete
  const index = cakes.findIndex(cake => cake.id === parseInt(id));
  if (index === -1) return false;
  
  cakes.splice(index, 1);
  return true;
};
