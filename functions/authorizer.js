
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const COGNITO_USERPOOL_ID = process.env.COGNITO_USERPOOL_ID;
const COGNITO_WEB_CLIENT_ID = process.env.COGNITO_WEB_CLIENT_ID;

const jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: COGNITO_USERPOOL_ID,
    tokenUse: "id",
    clientId: COGNITO_WEB_CLIENT_ID
  })


const generatePolicy = (principalId, effect, resource) => {
    var authReponse = {};
    var tmp = resource.split(':');
  var apiGatewayArnTmp = tmp[5].split('/');
  
  // Create wildcard resource: This ensures that caching cabalility of the Api-gateway
  // wouldn't be a problem for us.
  var resource = tmp[0] + ":" + tmp[1] + ":" + tmp[2] + ":" + tmp[3] + ":" + tmp[4] + ":" + apiGatewayArnTmp[0] + '/*/*';
    
  authReponse.principalId = principalId;
    if (effect && resource) {
      let policyDocument = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: effect,
            Resource: resource,
            Action: "execute-api:Invoke",
          },
        ],
      };
      authReponse.policyDocument = policyDocument;
    }
    authReponse.context = {
      foo: "bar",
    };
    console.log(JSON.stringify(authReponse));
    return authReponse;
  };

  export const handler = async (event, context, callback) => {
    // lambda authorizer code
    var token = event.authorizationToken;
    console.log(token);
    console.log(event);

    try {
        const payload = await jwtVerifier.verify(token);
        console.log(JSON.stringify(payload));
        callback(null, generatePolicy("user", "Allow", event.methodArn));
      } catch(err) {
        callback("Error: Invalid token");
      }


    /*
    switch(token){
        case "Allow":
            callback(null, generatePolicy("user", "Allow", event.methodArn));
            break;
        case "Deny":
            callback(null, generatePolicy("user", "Deny", event.methodArn));
            break;
        default:
            callback("Error! Invalid Token");
    } 
            */
  };