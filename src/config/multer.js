import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        if (file.mimetype === 'text/csv' || file.mimetype === 'application/csv') {
            callback(null, true);
        } else {
            callback(new Error('Formato inválido. Apenas arquivos CSV são aceitos.'));
        }
    }
});

export default upload;