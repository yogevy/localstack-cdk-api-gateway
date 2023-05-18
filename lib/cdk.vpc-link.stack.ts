import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { CfnVpcLink } from 'aws-cdk-lib/aws-apigatewayv2/lib/apigatewayv2.generated';

export class CdkVpcLinkStack extends Stack {
    vpcLink: CfnVpcLink;

    constructor(scope: Construct, id: string, private props: StackProps & { stage: string; vpc: ec2.IVpc }) {
        super(scope, id, props);

        this.createVpcLink();
    }

    private createVpcLink() {
        this.vpcLink = new apigatewayv2.CfnVpcLink(this, `vpc-link-${this.props.stage}`, {
            name: `ecs-vpc-link-${this.props.stage}`,
            subnetIds: this.props.vpc.privateSubnets.map((subnet) => subnet.subnetId),
        });
    }
}
