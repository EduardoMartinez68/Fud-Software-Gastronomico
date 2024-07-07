const database = require('../database');

//config the connection with digitalocean
const AWS= require('aws-sdk'); 
const {APP_NYCE,APP_ACCESS_KEY_ID,SECRET_ACCESS_KEY}=process.env; //Get our nyce3 for connection with digitalocean
const spacesEndpoint=new AWS.Endpoint(APP_NYCE)

//delate image
const fs = require('fs');
const path = require('path');


const s3=new AWS.S3({
    endpoint:spacesEndpoint,
    accessKeyId: APP_ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY
});

const bucketName = APP_NYCE;

//this is a function for get the path of the image of a table
async function get_path_img(schema, table, id) {
    var queryText = `SELECT * FROM "${schema}".${table} WHERE id=$1`;
    var values = [id];

    try {
        const result = await database.query(queryText, values);
        return result.rows[0].img;
    } catch (error) {
        console.error('Error to search the path img:', error.message);
        throw error;
    }
}

//this function is for delate the image of the tabla of the file img/uploads
async function delate_image_upload(pathImg) {
    const params = {
        Bucket: bucketName,
        Key: pathImg
      };
    
      try {
        await s3.deleteObject(params).promise();
        console.log(`Image ${pathImg} delete with success`);
        return true;
      } catch (err) {
        console.error('Error to delete the image:', err);
        return false;
    }
    /*
    var pathImage = path.join(__dirname, '../public/img/uploads', pathImg);
    fs.unlink(pathImage, (error) => {
        if (error) {
            console.error('Error to delate image:', error);
        } else {
            console.log('Image delate success');
        }
    });*/
}

async function get_image(id) {
    var queryText = 'SELECT * FROM "User".companies Where  id= $1';
    var values = [id];
    const result = await database.query(queryText, values);
    return result.rows[0].path_logo;
}

async function upload_image_to_space(filePath, objectName){
    const fileContent = fs.readFileSync(filePath);
  
    const params = {
      Bucket: bucketName,
      Key: objectName,
      Body: fileContent,
      ACL: 'public-read' // O 'private' si deseas que no sea público
    };
  
    try {
      const data = await s3.upload(params).promise();
      console.log('Image upload with success digitalocean:', data.Location);
      fs.unlinkSync(filePath); // delete file temporary
      return data.Location;
    } catch (err) {
      console.error('Error to upload the image to digitalocean:', err);
      return '';
    }
};

async function delete_image_from_space(objectName){
    const params = {
      Bucket: bucketName,
      Key: objectName
    };
  
    try {
      await s3.deleteObject(params).promise();
      console.log(`Image ${objectName} delete with success`);
      return true;
    } catch (err) {
      console.error('Error to delete the image:', err);
      return false;
    }
};

async function create_a_new_image(req){
    if(req.file){
        const filePath = req.file.path;
        const objectName = req.file.filename;
        const imageUrl = await upload_image_to_space(filePath, objectName);

        return imageUrl;
    }

    return '';
}

async function delate_image(id) {
    var pathImg = await get_image(id);
    const params = {
        Bucket: bucketName,
        Key: pathImg
      };
    
      try {
        await s3.deleteObject(params).promise();
        console.log(`Image ${pathImg} delete with success`);
        return true;
      } catch (err) {
        console.error('Error to delete the image:', err);
        return false;
    }
}


module.exports = {
    get_path_img,
    delate_image_upload,
    upload_image_to_space,
    delete_image_from_space,
    create_a_new_image,
    delate_image
};