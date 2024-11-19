const { ipcRenderer , dialog} = require('electron');

const btnSend = document.getElementById('btnSend');
const msgWrapper = document.getElementById('msgWrapper');
let queryFileDelete = document.getElementById('queryFileDelete');
let btnFiles = document.getElementById('btnFiles');

let countSucc = document.getElementById('countSucc');
let countFail = document.getElementById('countFail');

let msgSucc = 0;
let msgFail = 0;



 btnFiles.addEventListener('click',() =>{
    ipcRenderer.send('select','true');
 })

/* MESSAGGIO INVIATO */
ipcRenderer.on('msgSuccess',(e, data) =>{
    msgSucc++;
    countSucc.innerHTML = msgSucc;
    msgWrapper.innerHTML += `<li class="text-success">${data}</li>`
});

/* MESSAGGIO NON INVIATO */
ipcRenderer.on('msgFail',(e, data) =>{
    msgFail++;
    countFail.innerHTML = msgFail;
    msgWrapper.innerHTML += `<li class="text-danger">${data}</li>`
});

/* FILE NON TROVATO */
ipcRenderer.on('msgFile',(e, data) =>{
    msgWrapper.innerHTML += `<li class="text-warning">${data}</li>`
});

/* AVVIO WHATSAPP-WEB.JS BOT */
btnSend.addEventListener('click', () => {
    ipcRenderer.send('start',queryFileDelete.checked);
})

ipcRenderer.on('avvio-bot', () => {
    msgWrapper.innerHTML += `<li class="text-success fw-bolder">Avvio bot....</li>`
})














