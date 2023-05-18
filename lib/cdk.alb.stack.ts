import { Stack, StackProps, Tags, aws_s3 as s3 } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer, ListenerAction } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ApplicationListener } from 'aws-cdk-lib/aws-elasticloadbalancingv2/lib/alb/application-listener';

export class CdkApplicationLoadBalancerStack extends Stack {
    alb: ApplicationLoadBalancer;
    listener: ApplicationListener;

    constructor(scope: Construct, id: string, private props: StackProps & { stage: string; vpc: ec2.IVpc }) {
        super(scope, id, props);

        this.createApplicationLoadBalancer();
    }

    private createApplicationLoadBalancer(): void {
        const alb = new ApplicationLoadBalancer(this, `alb-${this.props.stage}`, {
            loadBalancerName: `alb-${this.props.stage}`,
            vpc: this.props.vpc,
            internetFacing: false,
        });

        const loggingBucket = new s3.Bucket(this, `alb-logs-bucket-${this.props.stage}`);

        alb.logAccessLogs(loggingBucket, `alb-log-${this.props.stage}`);

        const listener = alb.addListener(`alb-listener-${this.props.stage}`, {
            port: 80,
            defaultAction: ListenerAction.fixedResponse(404),
        });

        const defaultRule = new elbv2.ApplicationListenerRule(this, `alb-listener-health-check-${this.props.stage}`, {
            listener,
            priority: 100,
            conditions: [elbv2.ListenerCondition.pathPatterns(['/v1/health'])],
            action: ListenerAction.fixedResponse(200),
        });

        Tags.of(listener).add('stage', this.props.stage);
        Tags.of(defaultRule).add('stage', this.props.stage);

        this.alb = alb;
        this.listener = listener;
    }
}
