import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.5.438/pdf.min.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.5.438/pdf.worker.min.mjs';


//File select button logic
function getFile() {
    Neutralino.os.showOpenDialog('Select a PDF file', { filters: [{ name: 'PDF', extensions: ['pdf'] }] })
        .then(files => {
            // showOpenDialog resolves to an array of selected paths
            if(files && files.length > 0) {
                console.log(files[0]);
                displayPDF(files[0]);
            }
        })
        .catch(err => console.error(err));
}

//Display the selected PDF file on the canvas
async function displayPDF(path) {
    const canvas = document.getElementById('pdf-canvas');
    const context = canvas.getContext('2d');
    // Read the file through Neutralino since PDF.js can't fetch local filesystem paths
    const buffer = await Neutralino.filesystem.readBinaryFile(path);
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    loadingTask.promise.then(pdf => {
        pdf.getPage(1).then(page => {
            const viewport = page.getViewport({ scale: 1.5 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            page.render(renderContext);
        });
    });
}

// Expose for the inline onclick handler, since module scope isn't global
window.getFile = getFile;

Neutralino.init();
Neutralino.events.on("windowClose", () => {
  Neutralino.app.exit();
});