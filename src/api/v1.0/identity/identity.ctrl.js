const Joi = require('joi');
const AWS = require('aws-sdk');
const fs = require('fs');
const fileType = require('file-type');
const bluebird = require('bluebird');
const asyncBusboy = require('async-busboy');

const Ident = require('db/models/Identity');
const Bank = require('db/models/Bank');

const { AWS_ACCESS_KEY_ID: accessKeyId } = process.env;
const { AWS_SECRET_ACCESS_KEY: secretAccessKey } = process.env;

AWS.config.update({accessKeyId, secretAccessKey});

AWS.config.setPromisesDependency(bluebird);

const s3 = new AWS.S3();

const uploadFile = (buffer, name, type) => {
    const params = {
        ACL: 'public-read',
        Body: buffer,
        Bucket: "blocktoken.ai",
        ContentType: type.mime,
        Key: `${name}.${type.ext}`
    }
    return s3.upload(params).promise();
}

// const uploadIdentity = async (file) => {

//     if (!file) 
//         throw 400;

//     const path = file.path;
//     const buffer = fs.readFileSync(path);
//     const filetype = fileType(buffer);
//     console.log(filetype);

//     if(filetype === null){
//         throw 400;
//     }

//     const timestamp = Date.now().toString();
//     const fileName = `kyc-data/${timestamp}-lg`;
//     const {key} = await uploadFile(buffer, fileName, filetype);   

//     return key;
// }

exports.identSave = async (ctx)=> {
    const { user } = ctx.request;
    console.log('-------------------------');
    try{
        await Ident.deleteOne({user_id:user._id});
        const {files, fields} = await asyncBusboy(ctx.req);
        const {
            firstname,
            lastname,
            gender,
            birthday,
            country,
            type,
            number,
            expires
        } = fields;
        console.log(fields);      

        if(files.length != 2) {
            ctx.status = 400;
            return;
        }

        // upload front image to aws s3
        const path = files[0].path;
        const buffer = fs.readFileSync(path);
        const filetype = fileType(buffer);
        console.log(filetype);

        if(filetype === null){
            ctx.status = 400;
            return;
        }

        const timestamp = Date.now().toString();
        const fileName = `kyc-data/${timestamp}-lg`;
        const {key : front_s3_key} = await uploadFile(buffer, fileName, filetype);            
       
        console.log('front file upload success');
        console.log(`s3 key = ${front_s3_key}`);

        // upload back image to aws s3
        const path1 = files[1].path;
        const buffer1 = fs.readFileSync(path1);
        const filetype1 = fileType(buffer1);
        console.log(filetype1);

        if(filetype1 === null){
            ctx.status = 400;
            return;
        }

        const timestamp1 = Date.now().toString();
        const fileName1 = `kyc-data/${timestamp}-lg`;
        const {key : back_s3_key} = await uploadFile(buffer1, fileName1, filetype1);            

        console.log('back file upload success');        
        console.log(`s3 key = ${back_s3_key}`);

        const ident = new Ident({
            user_id:user._id,
            first_name:firstname,
            last_name:lastname,
            gender:gender,
            birthday:birthday,
            id_issuing_country:country,
            id_type:type,
            id_number:number,
            id_expires:expires,
            id_front:front_s3_key,
            id_bacak:back_s3_key
        });

        await ident.save();
    
        ctx.body = {
            _id: ident._id
        }

    } catch (error) {
        ctx.throw(error, 500);
    }
    
}

exports.bankSave = async (ctx)=> {
    const { user } = ctx.request;
  
    let {
        address,
        city,
        state,
        postcode,
        country,
        bankimg,
        institution_name,
        doc_type,
        issued_date
    } = ctx.request.body;
  
    try{
        await Bank.deleteOne({user_id:user._id});
        const bank = new Bank({
            user_id:user._id,
            address:address,
            city:city,
            state:state,
            postcode:postcode,
            country:country,
            bankimg:bankimg,
            institution_name:institution_name,
            doc_type:doc_type,
            issued_date:issued_date,
        });
    
        await bank.save();
        
        ctx.body = {
            _id: bank._id
        }
    } catch (e) {
        ctx.throw(e, 500);
    }
}

exports.getIdent = async (ctx)=> {
  const {user_id} = ctx.params;
  console.log(user_id);

  try {
    const ident = await Ident.findOne({user_id});
    
    ctx.body = {
      ident
    }
  } catch (e) {
    ctx.throw(e, 500);
  }
}

exports.getBank = async (ctx)=> {
    const {user_id} = ctx.params;
    console.log(user_id);
  
    try {
      const bank = await Bank.findOne({user_id});
      
      ctx.body = {
        bank
      }
    } catch (e) {
      ctx.throw(e, 500);
    }
  }