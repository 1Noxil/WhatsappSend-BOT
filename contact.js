const { log } = require('console');
const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'list.json');

let listWrapper = document.getElementById('listWrapper');

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) throw err;
    const userList = JSON.parse(data);
    userList.forEach((element, index) => {
        listWrapper.innerHTML += `
            <tr>
                 <th scope="row">${index +1}</th>
                <td>${element.file}</td>
                <td>${element.numerotelefono}</td>
                </tr>`
    });
})

document.getElementById('btnList').addEventListener('click',() => {
    ipcRenderer.send('open-file')
})