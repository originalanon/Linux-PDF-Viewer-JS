function getFile() {
    Neutralino.os.showOpenDialog('Select a PDF file', { filters: [{ name: 'PDF', extensions: ['pdf'] }] })
        .then(file => {
            if(file) {
                console.log(file);
            }
        })
        .catch(err => console.error(err));
}

Neutralino.init();
Neutralino.events.on("windowClose", () => {
  Neutralino.app.exit();
});
