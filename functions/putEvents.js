import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";

const EBclient = new EventBridgeClient();

const EVENT_BUS_NAME = process.env.EventBusName;
export const handler = async(event)=>{
   
  console.log(event);

  let { body, httpMethod } = event;  //destruction the event object extracting body 
                                      // and httpMethod

    body = JSON.parse(body);

    //put events to eventbridge
    const param = { 
        Entries: [ 
          { 
            Source: "fuel-app",
            DetailType: "user-signup",
            Detail: JSON.stringify({
                id: body.id,
                title: body.title,
                content: body.content,
                httpMethod: httpMethod
            }),
            EventBusName: EVENT_BUS_NAME,
          },
        ],
      };
    try{
        const command = new PutEventsCommand(param);
        const response = await EBclient.send(command);

        return {               //using return is like using callback()
            statusCode: 200,
            body: JSON.stringify("working...")
        }
    }catch(err){
        console.log(err);

    }
}
    