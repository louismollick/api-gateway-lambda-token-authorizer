import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export default class MyAuthorizer extends cdk.aws_apigateway.TokenAuthorizer {
  constructor(scope: Construct, handler: cdk.aws_lambda.IFunction) {
    super(scope, 'MyAuthorizer', {
      handler,
    });
  }
}
