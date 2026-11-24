let currentFilePath = null;
let currentBlobUrl = null;

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

//Load the selected PDF file into the embedded PDF.js viewer
async function displayPDF(path) {
    // Read the file through Neutralino since PDF.js can't fetch local filesystem paths
    const buffer = await Neutralino.filesystem.readBinaryFile(path);
    if(currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
    }
    currentBlobUrl = URL.createObjectURL(new Blob([buffer], { type: 'application/pdf' }));
    currentFilePath = path;
    const frame = document.getElementById('pdf-frame');
    frame.src = 'pdfjs/web/viewer.html?file=' + encodeURIComponent(currentBlobUrl);
}

//Save the PDF with any form fills and annotation edits applied
async function savePDF() {
    const frame = document.getElementById('pdf-frame');
    const app = frame.contentWindow?.PDFViewerApplication;
    if(!app || !app.pdfDocument) {
        console.warn('No PDF is open.');
        return;
    }
    try {
        // saveDocument() bakes form field values and annotation edits into the PDF bytes
        const data = await app.pdfDocument.saveDocument();
        const target = await Neutralino.os.showSaveDialog('Save PDF', {
            defaultPath: currentFilePath ?? 'document.pdf',
            filters: [{ name: 'PDF', extensions: ['pdf'] }]
        });
        if(target) {
            // Copy into a standalone ArrayBuffer for Neutralino
            await Neutralino.filesystem.writeBinaryFile(target, data.slice().buffer);
            console.log('Saved to ' + target);
        }
    } catch (err) {
        console.error(err);
    }
}

// Expose for the inline onclick handlers, since module scope isn't global
window.getFile = getFile;
window.savePDF = savePDF;

Neutralino.init();
Neutralino.events.on("windowClose", () => {
  Neutralino.app.exit();
});
