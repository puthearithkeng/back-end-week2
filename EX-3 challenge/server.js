const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;

    console.log(`Received ${method} request for ${url}`);

    if (url === '/' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return res.end('Welcome to the Home Page');
    }

    if (url === '/contact' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <form method="POST" action="/contact">
            <input type="text" name="name" placeholder="Your name" required />
            <button type="submit">Submit</button>
          </form>
        `);
        return;
    }

    if (url === '/contact' && method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            const parsed = querystring.parse(body);
            const name = parsed.name?.trim();

            if (!name) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                return res.end(`<h1>Name is required!</h1><a href="/contact">Go Back</a>`);
            }

            const submission = {
                name,
                timestamp: new Date().toISOString()
            };

            const filePath = path.join(__dirname, 'submissions.json');

            // Read existing data, append new one, then write
            fs.readFile(filePath, 'utf8', (err, data) => {
                let submissions = [];
                if (!err && data) {
                    try {
                        submissions = JSON.parse(data);
                    } catch (e) {
                        console.error('Invalid JSON format in file.');
                    }
                }

                submissions.push(submission);

                fs.writeFile(filePath, JSON.stringify(submissions, null, 2), (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        return res.end('Server error while saving submission.');
                    }

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`
                        <h1>Thank you, ${name}!</h1>
                        <p>Your submission was saved successfully.</p>
                        <a href="/contact">Submit another</a>
                    `);
                });
            });
        });
        return;
    }

    // 404 for everything else
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('404 Not Found');
});

server.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
    console.log('Server is running at http://localhost:3000/contact');
});

