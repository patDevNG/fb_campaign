const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");
const multer = require('multer')
const server = express();
const bodyParser = require("body-parser");
const Busboy = require("busboy");
const port = 4000;
const cors = require("cors");
const { log } = require("console");
server.use(bodyParser.urlencoded({ extended: true }));
server.use(cors());
server.use(bodyParser.json());

server.get("/", async (req, res) => {
  res.send("Testing my api:8084");
});

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, './files/images/');
    } else {
      cb({ message: 'this file is neither a video or image file' }, false);
    }
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

server.post("/create_fb_ad_campaign", upload.any(), async (req, res) => {
  // console.log(req.body, "this is the request from waitstaff-ui");
  console.log(req.files, 'files')
  console.log(req.body)
  const base64String = fs.readFileSync(req.files[0].path).toString("base64");
 
  // console.log({base64String})

  let {adset_name,age_range,gender,budget,ad_desc,location_targeting_people,device_platforms,platform_facebook,platform_messenger,
    budget_type,start_time,end_time,ad_title,ad_text, merchant_id, call_to_action,age_max, age_min,
    ads_messenger_welcome_message,ads_messenger_description,ads_messenger_button_text
  } = req.body
  console.log(req.files)
  //     let budget = req.params.budget;
   budget = parseInt(budget)*100;
     console.log(budget,"budgetttttttttttttt");
  //     const promoId = req.params.promo_id;

  //     const promoToBoost = await Promo.findById(promoId)
  //  console.log(promoToBoost);
  //  const{promo_text,promo_description,image_url,promo_name, merhant_id,location_id,promo_type} = promoToBoost;
  const bizSdk = require('facebook-nodejs-business-sdk');

  const accessToken = 'EAADxqKWGDYkBAOyKycXRMMocP77e8lntCZBSeGvK9ZBTSXnXjOLvDQCSm3W7LidEAK9kvFdUm4zDRp1ZAFw3enCnGELHrvlpAVv9eaVAZCZBHDLQve897ZBCl0cDcAD2cTHXDnWDeq3wZBKeTMZAkoxDsXw1VszoVv00Ke4dzZByDlgZDZD'
  // 'EAADxqKWGDYkBAMSNCs1TeIfOL476U7vayOcFUirtey7AAosCJ1ZBPbHJrocyov3isVh5rAfZCUWJhVnZBdtOro1sQnxpZCDGVAjPj0uSIKIXRXTnUuHYeuBRNkLXH1hCqiMRFKNokW8qxIsXVwYiE9EcBy53pv4mb9XO0PdYmZB0ISpNTI3jZCHpBVQk1D3wJYQH5VrQoLqxJv6GKMZBMKHpZCBwFyZAy4Da3r2OFeW9VprEahwkiQJlC';
  // EAADxqKWGDYkBAJK2TnmpynTtqXxmYNO53CaMTFmGkrAoOgerkdDlPseZCrJoFYoZAnCRKrHF6iDDFsk4EUcj2vRB3AkuKj23qrBPfMukbIicSzzcw09rP4noe6JIoAwBzPk7C0oo9tnjVtJqgN86ZCm2ymUsN84lWpnAEuDgQZDZD
  // const accountId = 'act_2517267978507637';
  const accountId ='act_210261016055454'

  const FacebookAdsApi = bizSdk.FacebookAdsApi.init(accessToken);
  const AdAccount = bizSdk.AdAccount;
  const Campaign = bizSdk.Campaign;
  const account = new AdAccount(accountId);
  console.log(account.id, "testing ")
  try {
      let special_ad_category = "NONE"
      const newCampaign = await account.createCampaign(
          [],
          {
              special_ad_categories :[],
              [Campaign.Fields.name]: adset_name, // Each object contains a fields map with a list of fields supported on that object.
              [Campaign.Fields.status]: Campaign.Status.paused,
              [Campaign.Fields.objective]: 'MESSAGES',
            }
      )
      const {id} =newCampaign ;
      console.log(id, "Campaign Id");
      let fields, params;
  fields = [
  ];
  params = {
    'name' : adset_name,
    'daily_budget' : budget,
    'campaign_id' : id,
    'bid_amount' : budget,
    'billing_event' : 'IMPRESSIONS',
    'optimization_goal' : 'CONVERSATIONS',
    'targeting' : {'age_min':age_min,'age_max':age_max,'behaviors':[],'genders':[gender],'geo_locations':{'countries':['US'],}},
    'status' : 'PAUSED',
    "device_platforms ": [
      "all "
    ]
  };
  const adsets =await account.createAdSet(
      fields,
      params
    );
    console.log(adsets.id, "adset Id")

    const adImage = await account.createAdImage([], {
      bytes: base64String,
    });

     fs.unlinkSync(req.files[0].path);
    const adCreative = await account.createAdCreative(
        [],
        {
          'name':adset_name,
          "object_story_spec":
          { 
            "link_data": { 
              "name":ad_title,
              "call_to_action": {"type":"ORDER_NOW","value":{"app_destination":"MESSENGER"}}, 
              "image_hash": adImage.images.bytes.hash, 
              "link": 'http://order.joyup.me/?merchant_id=5a7371c9a67ad0001a1023f8&location_id=36XR5VCKR6AXJ&page_id=369499770162312&ps_id=1600924856622496&type=delivery', 
              "message": ad_text,
              // 'body':ad_text,
              "page_welcome_message": {
                "message": {
                  "attachment": {
                    "type":"template",
                    "payload": {
                      "template_type":"generic",
                      "elements": [
                        {
                          "title":ads_messenger_welcome_message,
                          "image_url":adImage.images.bytes.url,
                          "subtitle":ads_messenger_description,
                          "buttons": [
                            {
                              "type":"postback",
                              "payload":"GETSTARTED",
                              "title":ads_messenger_button_text?ads_messenger_button_text:"Claim Offer"
                            },
                           
                          ]
                        }
                      ]
                    }
                  },
              
                }
              }
            },
            // 270763243298231
            // 369499770162312
            "page_id": "369499770162312" 
          }
          // {
          //     "link_data": {
          //       "call_to_action": {"type":"ORDER_NOW","value":{"app_destination":"MESSENGER"}},
          //        "image_hash": adImage.images.bytes.hash,
               
          //       "message": ad_desc,
          //     },
          //     "image_hash": adImage.images.bytes.hash,
          //     "link": "https://fb.com/messenger_doc/",
          //     "page_id": "270763243298231",
          //     "message": "Body from Patrick...",
          //   "page_welcome_message":pageMessage
            
          //   }

        }
    )
    console.log(adCreative.id, "Ad creative ID")

    const createAd = await account.createAd(
        [],
        {
          'name' : adset_name,
          'adset_id' : adsets.id,
          'creative' : {'creative_id':adCreative.id},
          'status' : 'PAUSED',
        }
    )

  res.status(200).send(createAd);
  } catch (error) {
      console.log(error);
      res.status(500).send(error)
  }
});

server.post("/ad_image", async (req, res) => {
  
  
  const bizSdk = require("facebook-nodejs-business-sdk");

  const accessToken =
    "EAADxqKWGDYkBAO96f8ZCeZBZAnyCZBMvJFHUuLqAqZCRQxZAOHzxdDZCqwGrGRQ159MlbkwZAkj0jFhCL2uXdm6enEL3Qfmh0eJLIutl5Tb40qHQP6CZBOHpNdY4p3LiZCJmLxdtBKNpX3O4T2tUg3FD6F4ZBcKQ4UEzfaFGZCa5WePZAQgZDZD";
  // const accountId = 'act_2517267978507637';
  const accountId = "act_210261016055454";

  const FacebookAdsApi = bizSdk.FacebookAdsApi.init(accessToken);
  const AdAccount = bizSdk.AdAccount;
  const Campaign = bizSdk.Campaign;
  const account = new AdAccount(accountId);

  let filepath = "image.png";
  let content = fs.readFileSync(filepath).toString("base64");
  try {
    const adImage = await account.createAdImage([], {
      bytes: content,
    });
    res.status(200).send(adImage.images.bytes.hash);
  } catch (error) {
    res.status(500).send(error);
  }
});

server.post("/preview_ad",upload.any(), async(req,res)=>{
  const bizSdk = require('facebook-nodejs-business-sdk');
  console.log(req.files, 'files')
  console.log(req.body)
  const base64String = fs.readFileSync(req.files[0].path).toString("base64");
 
  // console.log({base64String})

  let {adset_name,age_range,gender,budget,ad_desc,location_targeting_people,device_platforms,platform_facebook,platform_messenger,
    budget_type,start_time,end_time,ad_title,ad_text, merchant_id, call_to_action,age_max, age_min,
    ads_messenger_welcome_message,ads_messenger_description,ads_messenger_button_text
  } = req.body
  const accessToken = 'EAADxqKWGDYkBAITPWDsZB5HQPCuuoqxwUWIyZAGPSu8ZAuKgZAr5SwKHrEKeY0IJojLloUCBT3JGZBeRLopEMMcBeiBhmMueanksXyqNsm4qF1peEhKFKDcVCuFGaSNtr3rsld8meGYWHUKFIW8vGpPvTiYaRf3SP3Qsvp1OaKuFYsZAHn2crOb48hKGwtJsmrAEpOqiHj7SQMG5XNbDBZA5TrZC3jRzFWttkC96KZAjzPQZDZD';
  const FacebookAdsApi = bizSdk.FacebookAdsApi.init(accessToken);
  console.log(req.files)
  
  const AdAccount = bizSdk.AdAccount;
  const AdPreview = bizSdk.AdPreview;
  const accountId ='act_210261016055454'
  const account = new AdAccount(accountId);
  
  // const FacebookAdsApi = bizSdk.FacebookAdsApi.init(accessToken);

  // await bizSdk.FacebookAdsApi.init(accessToken);

try {
  
  const adImage = await account.createAdImage([], {
    bytes: base64String,
  });
  let fields, params;
  fields = [];
  params ={
    'creative':{ "object_story_spec":
    { 
      "link_data": { 
        "name":ad_title,
        "call_to_action": {"type":"ORDER_NOW","value":{"app_destination":"MESSENGER"}}, 
        "image_hash": adImage.images.bytes.hash, 
        "link": 'http://order.joyup.me/?merchant_id=5a7371c9a67ad0001a1023f8&location_id=36XR5VCKR6AXJ&page_id=369499770162312&ps_id=1600924856622496&type=delivery', 
        "message": ad_text,
        // 'body':ad_text,
        "page_welcome_message": {
          "message": {
            "attachment": {
              "type":"template",
              "payload": {
                "template_type":"generic",
                "elements": [
                  {
                    "title":ads_messenger_welcome_message,
                    "image_url":adImage.images.bytes.url,
                    "subtitle":ads_messenger_description,
                    "buttons": [
                      {
                        "type":"postback",
                        "payload":"GETSTARTED",
                        "title":ads_messenger_button_text?ads_messenger_button_text:"Claim Offer"
                      },
                     
                    ]
                  }
                ]
              }
            },
        
          }
        }
      },
      // 270763243298231
      // 369499770162312
      "page_id": "369499770162312" 
    }
  },
  'ad_format':'MOBILE_FEED_STANDARD'
  }
  const generatedPreviews = await account.getGeneratePreviews(
    fields,
    params
  );
  res.status(200).send(generatedPreviews);
} catch (error) {
  console.log(error);
  res.status(500).send(error)
}

})
server.listen(process.env.PORT || 8584, () => {
  console.log(`Server started at port :8584`);
});

