import { Stack, StackProps, CfnOutput, Tag, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import * as ecs from 'aws-cdk-lib/aws-ecs';

export class CdkEcsStack extends Stack {
    constructor(scope: Construct, id: string, private props: StackProps & { stage: string; vpc: ec2.IVpc }) {
        super(scope, id, props);

        this.createEcsCluster();
    }

    private createEcsCluster(): Cluster {
        const cluster = new ecs.Cluster(this, `ecs-cluster-${this.props.stage}`, {
            vpc: this.props.vpc,
            clusterName: `ecs-cluster-${this.props.stage}`,
        });

        return cluster;
    }
}
