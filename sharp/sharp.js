const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const fsPromises = require('fs').promises;

const imageCrop = async (req, res, next) => {

    let inputImgPath= req.files[0]?.path || null
   

    console.log(inputImgPath)
    console.log(req.body.imageImport)


    if (inputImgPath === null) {
      return next()
    }
    try {

        const inputImgBuffer = await fsPromises.readFile(inputImgPath);

        // Process the image with sharp
        const processedImg = await sharp(inputImgBuffer)
            .resize(440, 700)
            .toFormat('webp')
            .toBuffer();

        // Write the processed image back to the original file
        await fsPromises.writeFile(inputImgPath, processedImg);

        console.log('Successfully saved sharpened image to file path', inputImgPath);
        next();
    } catch (err) {
        console.error('Error while processing or saving the image:', err);
        next(err);
    }
};

module.exports = imageCrop
