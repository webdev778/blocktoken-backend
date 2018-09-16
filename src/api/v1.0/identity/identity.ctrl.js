const Joi = require('joi');
const AWS = require('aws-sdk');
const fs = require('fs');
const fileType = require('file-type');
const bluebird = require('bluebird');
const multiparty = require('multiparty');

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

exports.identSave = async (ctx)=> {
    const { user } = ctx.request;
    console.log('-------------------------');
    try{
        await Ident.deleteOne({user_id:user._id});
        console.log("TEST");
        const form = new multiparty.Form();
        const {fields: {
            firstname,
            lastname,
            gender,
            birthday,
            country,
            type,
            number,
            expires,
        }, files} = await form.parse(ctx.request);
        console.log(fields);
        console.log(files);
        const path = files.file[0].path;
        const buffer = fs.readFileSync(path);
        const filetype = fileType(buffer);
        const timestamp = Date.now().toString();
        const fileName = `kyc-data/${timestamp}-lg`;
        const data = await uploadFile(buffer, fileName, filetype);            

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
            id_front:data,
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