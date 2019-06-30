const {app, BrowserWindow, ipcMain} = require('electron');

const OAuth2Provider = require('electron-oauth-helper/dist/oauth2').default;

let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1024,
    height: 720,
    backgroundColor: '#ffffff',
    icon: `file://${__dirname}/www/assets/logo.png`,
    webPreferences: {
      nodeIntegration: true,
      backgroundThrottling: false,
    }
  });


  win.loadURL(`file://${__dirname}/www/index.html`);

  //// uncomment below to open the DevTools.
  win.webContents.openDevTools();

  // Event when the window is closed.
  win.on('closed', function () {
    win = null
  })
}

// Create window on electron intialization
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow()
  }
});

ipcMain.on("oauth", (event, type) => {
  const config = {
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_SECRET',
    redirect_uri: 'YOUR_REDIRECT_URI',
    authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    response_type: "token",
    scope: "https://www.googleapis.com/auth/userinfo.profile",
  };
  if (!config) {
    console.warn(`Unknown type: "${type}"`);
    return
  }

  const provider = new OAuth2Provider(config);

  const options = Object.assign({
    show: false,
    width: 600,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  let window = new BrowserWindow(options);
  window.once("ready-to-show", () => {
    window.show()
  });
  window.once("closed", () => {
    window = null
  });

  provider
    .perform(window)
    .then(resp => {
      console.log("Got response:", resp);
      event.reply('oauthToken', resp);
      window.close();
    })
    .catch(error => console.error(error))
});
