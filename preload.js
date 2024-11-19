window.addEventListener('DOMContentLoaded', () => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'list.json');
    
    // Lettura del file JSON
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) throw err;
        const userList = JSON.parse(data);
        document.getElementById('listCount').innerHTML = userList.length
        
    });
})
