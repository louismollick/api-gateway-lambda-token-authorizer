import { Callback, Context } from 'aws-lambda/handler';
import { APIGatewayTokenAuthorizerEvent } from 'aws-lambda/trigger/api-gateway-authorizer';

export const handler = function (
  event: APIGatewayTokenAuthorizerEvent,
  _: Context,
  callback: Callback
) {
  console.log(event);
  callback(null, generatePolicy('user', 'Allow', event.methodArn));
};

var generatePolicy = function (
  principalId: string,
  effect: string,
  resource: string
) {
  return {
    principalId: principalId,
    policyDocument: {
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
      Version: '2012-10-17',
    },
  };
};
