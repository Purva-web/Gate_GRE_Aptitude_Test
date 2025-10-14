const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json'));

// Reassign sequential numeric IDs
db.users.forEach((user, index) => {
  user.id = index + 1;
});

fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
console.log("IDs fixed and made sequential!");
