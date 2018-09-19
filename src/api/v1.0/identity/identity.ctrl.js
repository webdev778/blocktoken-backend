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

const uploadIdentity = async (file) => {

    if (!file) 
        return null;

    const path = file.path;
    const buffer = fs.readFileSync(path);
    const filetype = fileType(buffer);
    console.log(filetype);

    if(filetype === null){
        return null;
    }

    const timestamp = Date.now().toString();
    const fileName = `kyc-data/${timestamp}-lg`;
    const {key} = await uploadFile(buffer, fileName, filetype);   

    return key;
}

exports.identSave = async (ctx)=> {

    const { user } = ctx.request;
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

        if(files.length != 2) {
            ctx.status = 400;
            return;
        }

        // upload front image to aws s3
        const front_s3_key = await uploadIdentity(files[0]);
        if(front_s3_key === null){
            ctx.status = 400;
            return;
        }           
       
        console.log('front file upload success');
        console.log(`s3 key = ${front_s3_key}`);

        // upload back image to aws s3
        const back_s3_key = await uploadIdentity(files[1]);        
        if(back_s3_key === null){
            ctx.status = 400;
            return;
        }           

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
            id_back:back_s3_key
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

    try{
        await Bank.deleteOne({user_id:user._id});

        const {files, fields} = await asyncBusboy(ctx.req);
        const {
            address,
            city,
            state,
            postcode,
            country,
            institution_name,
            doc_type,
            issued_date
        } = fields; 

        // upload bank bill to aws s3
        const bank_key = await uploadIdentity(files[0]);
        if(bank_key === null){
            ctx.status = 400;
            return;
        }

        const bank = new Bank({
            user_id:user._id,
            address:address,
            city:city,
            state:state,
            postcode:postcode,
            country:country,
            bankimg:bank_key,
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

  try {
    const ident = await Ident.findOne({user_id});
    console.log(ident);
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