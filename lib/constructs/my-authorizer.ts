import * as cdk from 'aws-cdk-lib';
import { IdentitySource } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export default class MyAuthorizer extends cdk.aws_apigateway.RequestAuthorizer {
  constructor(scope: Construct, handler: cdk.aws_lambda.IFunction) {
    super(scope, 'MyAuthorizer', {
      handler,
      identitySources: [IdentitySource.header('Authorization')],
    });
  }
}
