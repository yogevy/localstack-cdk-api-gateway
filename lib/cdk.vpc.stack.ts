import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class CdkVpcStack extends Stack {
    vpc: ec2.IVpc;

    constructor(scope: Construct, id: string, private props: StackProps & { stage: string }) {
        super(scope, id, props);

        this.createVpc();
    }

    private createVpc(): void {
        this.vpc = new ec2.Vpc(this, `vpc-${this.props.stage}`, {
            vpcName: `vpc-${this.props.stage}`,
        });
    }
}
