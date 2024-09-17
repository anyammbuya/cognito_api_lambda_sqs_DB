import { DynamoDBClient, PutItemCommand, UpdateItemCommand, ScanCommand,
  DeleteItemCommand, GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

var client = new DynamoDBClient({ region: 'us-east-1' });
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;


export const handler = async (event) => {
    let records = event.Records;
    let batchItemFailures = [];

    if (records.length) {
      for (const record of records) {
        try {
          if(record.body){
            console.log(record);
            console.log(record.body);
            
          const parsedBody = JSON.parse(record.body);
          let data= parsedBody.detail;
          
            if(typeof data.id !== 'string') {
            throw new Error("id Must be a String");
          }
            
          if(data.httpMethod==="POST"){
              console.log("I see you");
           
           
                const params = {
                 "TableName":`${NOTES_TABLE_NAME}`,
                 "Item": {
                   "notesId": {"S": `${data.id}`},
                   "title": {"S": `${data.title}`},
                   "content": {"S": `${data.content}`},
                 },
                 ConditionExpression: "attribute_not_exists(notesId)"
                }
                const command = new PutItemCommand(params);
                try {
                  const response = await client.send(command);
                  console.log(response);
                } catch (err) {
                  console.error(err);
                }   
            }
          }
       
        } catch (err) {
          batchItemFailures.push({
            itemIdentifier: record.messageId,
          });
        }
      }
    }
    return { batchItemFailures };
  };
  