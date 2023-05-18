import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { CfnVpcLink } from 'aws-cdk-lib/aws-apigatewayv2/lib/apigatewayv2.generated';
import { ApplicationListener } from 'aws-cdk-lib/aws-elasticloadbalancingv2/lib/alb/application-listener';

export class CdkApiGatewayStack extends Stack {
    constructor(
        scope: Construct,
        id: string,
        private props: StackProps & { stage: string; vpcLink: CfnVpcLink; albListener: ApplicationListener },
    ) {
        super(scope, id, props);

        this.createApiGateway();
    }

    private createApiGateway() {
        const httpApi = new apigatewayv2.CfnApi(this, 'ecs-api', {
            name: `ecs-api-${this.props.stage}`,
            protocolType: 'HTTP',
            // basePath: this.props.stage,
        });

        const httpIntegration = new apigatewayv2.CfnIntegration(this, 'HttpIntegration', {
            apiId: httpApi.ref,
            connectionId: this.props.vpcLink.ref,
            connectionType: 'VPC_LINK',
            integrationMethod: 'ANY',
            integrationType: 'HTTP_PROXY',
            integrationUri: this.props.albListener.listenerArn,
            payloadFormatVersion: '1.0',
            requestParameters: { 'overwrite:path': `$request.path` },
        });

        new apigatewayv2.CfnRoute(this, 'ProxyRoute', {
            apiId: httpApi.ref,
            routeKey: 'ANY /v1/{any+}',
            target: `integrations/${httpIntegration.ref}`,
        });

        new apigatewayv2.CfnStage(this, `${this.props.stage}`, {
            apiId: httpApi.ref,
            stageName: this.props.stage,
            autoDeploy: true,
        });

        new CfnOutput(this, 'APIUrl', { value: httpApi.attrApiEndpoint });
    }
}
