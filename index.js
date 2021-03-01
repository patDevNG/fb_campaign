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
    budget_type,start_time,end_time,ad_title,ad_text, merchant_id, call_to_action,age_max, age_min
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

  const accessToken = 'EAADxqKWGDYkBAMSNCs1TeIfOL476U7vayOcFUirtey7AAosCJ1ZBPbHJrocyov3isVh5rAfZCUWJhVnZBdtOro1sQnxpZCDGVAjPj0uSIKIXRXTnUuHYeuBRNkLXH1hCqiMRFKNokW8qxIsXVwYiE9EcBy53pv4mb9XO0PdYmZB0ISpNTI3jZCHpBVQk1D3wJYQH5VrQoLqxJv6GKMZBMKHpZCBwFyZAy4Da3r2OFeW9VprEahwkiQJlC';
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
          // 'body':[
          //   {'text':ad_text}
          // ],
          

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
                          "title":ad_title,
                          "image_url":adImage.images.bytes.url,
                          "subtitle":ad_desc,
                          "buttons": [
                            {
                              "type":"web_url",
                              "url":"http://order.joyup.me/?merchant_id=5a7371c9a67ad0001a1023f8&location_id=36XR5VCKR6AXJ&page_id=369499770162312&ps_id=1600924856622496&type=delivery",
                              "title":"Delivery"
                            },
                            {
                              "type":"web_url",
                              "url":"http://order.joyup.me/?merchant_id=5a7371c9a67ad0001a1023f8&location_id=36XR5VCKR6AXJ&page_id=369499770162312&ps_id=1600924856622496&type=pickup",
                              "title":"Pickup",
                              
                            }
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

server.post("/preview_ad", async(req,res)=>{
  
})
server.listen(process.env.PORT || 8584, () => {
  console.log(`Server started at port :8584`);
});

