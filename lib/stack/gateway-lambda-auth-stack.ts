import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import MyAuthorizer from '../constructs/my-authorizer';

/**
 * Stack, which creates restApi Gateway, with TokenAuthorizer
 *
 * @export
 * @class GatewayLambdaAuth
 * @extends {cdk.Stack}
 */
export class GatewayLambdaAuth extends cdk.Stack {
  readonly operationalLambda: cdk.aws_lambda.IFunction;
  readonly lambdaIntegration: cdk.aws_apigateway.LambdaIntegration;

  readonly operationalEntryPath = path.join(
    __dirname + '/../lambdas/operational/index.ts'
  );
  readonly authLambdaEntryPath = path.join(
    __dirname + '/../lambdas/authorizer/index.ts'
  );

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /** Creating operational Lambda, which server the request */
    const operationalLambda = this.getOperationalFunction();

    /** Lambda, which takes incoming request and checks the authorization and authentication */
    const authorizerLambda = this.getLambdaAuthFunction();

    /** Generating Authorizer, which will be injected to API Gateway */
    const lambdaAuthorizer = new MyAuthorizer(this, authorizerLambda);

    /** Creating Rest API */
    const restApi = this.createRestApi(lambdaAuthorizer);

    const integration = new cdk.aws_apigateway.LambdaIntegration(
      operationalLambda
    );

    /** Creating /health resource at root for lambda Rest API */
    const healthResource = restApi.root.addResource('health');
    healthResource.addMethod('GET', integration);

    /** Returning Output with URL made as part of restApi */
    new cdk.CfnOutput(this, 'apiUrl', { value: restApi.url });
  }

  /**
   * Creating Operational Lambda, to server the incoming request
   *
   * @private
   * @return {*}  {cdk.aws_lambda.IFunction}
   * @memberof GatewayLambdaAuth
   */
  private getOperationalFunction(): cdk.aws_lambda.IFunction {
    return new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      'operational-lambda',
      {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        description: 'Operational Lambda',
        entry: this.operationalEntryPath,
        logRetention: cdk.aws_logs.RetentionDays.ONE_DAY,
        memorySize: 512,
        timeout: cdk.Duration.minutes(2),
      }
    );
  }

  /**
   * Creating Authorization Lambda, to validate incoming request
   *
   * @private
   * @return {*}  {cdk.aws_lambda.IFunction}
   * @memberof GatewayLambdaAuth
   */
  private getLambdaAuthFunction(): cdk.aws_lambda.IFunction {
    return new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      'authentication-lambda',
      {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        description: 'Lambda Authorizer',
        entry: this.authLambdaEntryPath,
        logRetention: cdk.aws_logs.RetentionDays.ONE_DAY,
        memorySize: 512,
        timeout: cdk.Duration.minutes(2),
      }
    );
  }

  /**
   * Creating Lambda Rest API, that integrates API to Operational Lambda with Authorizer
   *
   * @private
   * @param {cdk.aws_apigateway.IAuthorizer} lambdaAuthorizer
   * @return {*}  {cdk.aws_apigateway.restApi}
   * @memberof GatewayLambdaAuth
   */
  private createRestApi(
    lambdaAuthorizer: cdk.aws_apigateway.IAuthorizer
  ): cdk.aws_apigateway.RestApi {
    return new cdk.aws_apigateway.RestApi(this, 'rest-api-gateway', {
      defaultMethodOptions: {
        authorizer: lambdaAuthorizer,
      },
    });
  }
}

/**
 *  API
 *  https://{GatewayId}.execute-api.us-east-1.amazonaws.com/dev/health
 */
