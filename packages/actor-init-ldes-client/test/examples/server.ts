const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.get('/examples', (req: any, res: any) => {
    const fileName = req.query.fileName;
    const filePath = path.join(__dirname, `./${fileName}`);
    const readStream = fs.createReadStream(filePath);
    res.status(200).type('application/ld+json');

    readStream.pipe(res);
});

const server = app.listen(3000, () => console.log('Server running on port 3000'));

module.exports = server;
