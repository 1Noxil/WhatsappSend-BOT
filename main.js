const { app, BrowserWindow , ipcMain, dialog, webContents} = require('electron');
const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { log } = require('console');
const { exec } = require('child_process');

let mainWindow;
let qrWindow;
let pathFiles;
let pathList = path.join(__dirname,'list.json')

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname,'preload.js')
        },
        icon: path.join(__dirname, './media/img/icon.png')
    })
    mainWindow.loadFile('index.html')   
}



app.whenReady().then(() => {
    createWindow()
})

ipcMain.on('select', (e,data) =>{
    pathFiles = dialog.showOpenDialogSync({properties: ['openFile', 'openDirectory']})
})
ipcMain.on('inputFiles',(e,data) => {
    inputFiles = data ;
})

//WHATSAPP-BOT


ipcMain.on('start', (e,query) => {
    if(!pathFiles){
        dialog.showErrorBox('Nessun file selezionato',"Seleziona una cartella")
    } else {
    // Carica la mappatura dei file con i numeri di telefono
    mainWindow.webContents.send('avvio-bot') // Avviso utente, bot avviato
    const fileMappings = JSON.parse(fs.readFileSync('list.json', 'utf-8'));
    
    // Inizializzare il client con salvataggio automatico della sessione
    const client = new Client({
        authStrategy: new LocalAuth() // Questo salva automaticamente le sessioni
    });
    
    // Genera il codice QR per l'autenticazione
    client.on('qr', (qr) => {
        qrWindow = new BrowserWindow({
            width: 480,
            height: 600,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
            icon: path.join(__dirname, './media/img/icon.png')
        })
        qrcode.toFile('./qrcode.png',qr)
        qrWindow.loadFile('qr.html')
    });
    // Funzione per ottenere la data dinamica
    function getDynamicMessage() {
        const currentDate = new Date();
        const month = currentDate.toLocaleString('it-IT', { month: 'long' });
        const year = currentDate.getFullYear();
        let msg = `MESSAGGIO DI PROVA`;
        
        return msg;
    }
    
    // Evento quando il client è pronto
    client.on('ready', () => {
        console.log('Client è pronto per inviare i file.');
        
        // Itera sulla mappatura dei file e invia i file
        fileMappings.forEach(async ({ file, numerotelefono }, index) => {
            const filePath = path.join(`${pathFiles}`, file);
            console.log(pathFiles)
            
            // Verifica che il file esista
            if (fs.existsSync(filePath)) {
                console.log(`Inviando il file ${file} al numero ${numerotelefono}...`);
                
                // Carica il file come media
                const media = MessageMedia.fromFilePath(filePath);
                
                // Controlla se il nome del file contiene "_boll"
                if (file.includes('_boll')) {
                    // Invia solo il file senza messaggio testuale
                    client.sendMessage(numerotelefono + '@c.us', media).then(response => {
                        console.log(`File inviato senza messaggio a ${numerotelefono}`);
                        
                        // Elimina il file dopo il successo dell'invio
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.error(`Errore durante l'eliminazione del file ${filePath}:`, err);
                            } else {
                                console.log(`File ${filePath} eliminato con successo.`);
                            }
                        });
                    }).catch(err => {
                        console.error(`Errore durante l'invio del file a ${numerotelefono}:`, err);
                    });
                } else {
                    // Ottieni il messaggio dinamico
                    const message = getDynamicMessage();
                    
                    // Invia il messaggio e il file
                    client.sendMessage(numerotelefono + '@c.us', `${message}`).then(() => {
                        return client.sendMessage(numerotelefono + '@c.us', media);
                    }).then(response => {
                        console.log(`File e messaggio inviati a ${numerotelefono}`)
                        mainWindow.webContents.send('msgSuccess',`File e messaggio inviati a ${numerotelefono}`)
                        
                        // Elimina il file dopo il successo dell'invio
                        if(query){
                            fs.unlink(filePath, (err) => {
                                if (err) {
                                    console.error(`Errore durante l'eliminazione del file ${filePath}:`, err);
                                } else {
                                    console.log(`File ${filePath} eliminato con successo.`);
                                }
                            });
                        }
                    }).catch(err => {
                        console.error(`Errore durante l'invio del file a ${numerotelefono}:`, err);
                        mainWindow.webContents.send('msgFail',`Errore durante l'invio del file a ${numerotelefono}:`)
                    });
                }
            } else {
                console.error(`Il file ${file} non esiste.`);
                mainWindow.webContents.send('msgFile',`Il file ${file} non esiste.`)
            }
        });
    });
    
    // Avvia il client
    client.initialize();
    
    
    } 
});


ipcMain.on('open-file', () => {
    const child = exec(`notepad "${pathList}"`)
    child.on('close',() => {
        mainWindow.reload()
    })
})


