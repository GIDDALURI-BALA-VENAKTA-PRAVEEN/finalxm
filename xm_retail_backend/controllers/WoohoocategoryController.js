import axios from "axios";
import {generateWoohooSignature} from "../generateSignature.js";

const woohooCategory= 'https://sandbox.woohoo.in/rest/v3/catalog/categories';

export const getWoohooCategories = async(req,res) =>{
    try{
        const method='GET';
        const {signature,dateAtClient} = generateWoohooSignature(
            woohooCategory,
            method,
            process.env.clientSecret,
        );

        const response = await axios.get(woohooCategory,{
            headers:{
                Authorization: `Bearer ${process.env.bearerToken}`,
                signature,
                dateAtClient,
                'Content-Type': 'application/json',
                Accept: '*/*',
            },
        });
        res.json(response.data);
    }catch(error){
      console.log(`Woohoo Categories API error ${error.message}`);
      res.status(500).json({error: 'woohoo API failed', details: error.message});
    }
};