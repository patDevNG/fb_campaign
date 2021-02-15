const express = require('express');
const axios = require('axios');
const server = express()
const port = 4000;
const cors = require('cors')

server.use(cors);

server.get("/", async(req,res)=>{
    res.send("Testing my api:8084")
})


server.post('/create_fb_ad_campaign', async(req,res)=>{
    console.log(req.body, "this is the request from waitstaff-ui")
    let {adset_name,age_range,gender,budget,ad_desc} = req.body
  //     let budget = req.params.budget;
   budget = parseInt(budget)*100;
  //    console.log(budget,"budgetttttttttttttt");
  //     const promoId = req.params.promo_id;
  
  //     const promoToBoost = await Promo.findById(promoId)
  //  console.log(promoToBoost);
  //  const{promo_text,promo_description,image_url,promo_name, merhant_id,location_id,promo_type} = promoToBoost;
    const bizSdk = require('facebook-nodejs-business-sdk');
  
    const accessToken = 'EAADxqKWGDYkBAO96f8ZCeZBZAnyCZBMvJFHUuLqAqZCRQxZAOHzxdDZCqwGrGRQ159MlbkwZAkj0jFhCL2uXdm6enEL3Qfmh0eJLIutl5Tb40qHQP6CZBOHpNdY4p3LiZCJmLxdtBKNpX3O4T2tUg3FD6F4ZBcKQ4UEzfaFGZCa5WePZAQgZDZD';
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
                [Campaign.Fields.objective]: 'LINK_CLICKS',
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
      'optimization_goal' : 'IMPRESSIONS',
      'targeting' : {'age_min':age_range.age_min,'age_max':age_range.age_max,'behaviors':[],'genders':[gender],'geo_locations':{'countries':['US'],}},
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
    
      const adCreative = await account.createAdCreative(
          [],
          {
            'name':adset_name,
            "object_story_spec":{ 
                "link_data": { 
                  "call_to_action": {"type":"ORDER_NOW","value":{"app_destination":"MESSENGER"}}, 
                  "image_hash": "03b0c12161e5a689354c2d34419d98cc", 
                  "link": "www.joyup.me", 
                  "message": ad_desc, 
                }, 
                "page_id": "270763243298231" 
              }
             
          }
      )
      console.log(adCreative.id, "Ad creative ID")
    
      const createAd = await account.createAd(
          [],
          {
            'name' : 'My Ad',
            'adset_id' : adsets.id,
            'creative' : {'creative_id':adCreative.id},
            'status' : 'PAUSED',
          }
      )
      
       
    
        res.status(200).send(createAd)
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
  })
server.listen(process.env.PORT || 8585,()=>{
    console.log(`Server started at port :${port}`)
})