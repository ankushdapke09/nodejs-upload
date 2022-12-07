const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
       cb(null, __basedir + '/file/')
    },
    filename: (req, file, cb) => {
       cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
    }
  });   
   const maxSize = 2*1024*1024
   const upload = multer({
   storage: storage,
   limits: { fileSize: maxSize }
});

module.exports = upload;