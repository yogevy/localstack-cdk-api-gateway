#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkVpcStack } from '../lib/cdk.vpc.stack';
import { CdkEcsStack } from '../lib/cdk.ecs.stack';
import { CdkApplicationLoadBalancerStack } from '../lib/cdk.alb.stack';
import { CdkVpcLinkStack } from '../lib/cdk.vpc-link.stack';
import { CdkApiGatewayStack } from '../lib/cdk.api-gateway.stack';

const app = new cdk.App();

const stage = app.node.tryGetContext('stage') || 'local';

const vpcStack = new CdkVpcStack(app, `cdk-vpc-${stage}-stack`, {
    env: {
        region: process.env.CDK_DEFAULT_REGION,
        account: process.env.CDK_DEFAULT_ACCOUNT,
    },
    tags: { stage },
    stage,
});

new CdkEcsStack(app, `cdk-ecs-${stage}-stack`, {
    env: {
        region: process.env.CDK_DEFAULT_REGION,
        account: process.env.CDK_DEFAULT_ACCOUNT,
    },
    tags: { stage },
    stage,
    vpc: vpcStack.vpc,
});

const albStack = new CdkApplicationLoadBalancerStack(app, `cdk-alb-${stage}-stack`, {
    env: {
        region: process.env.CDK_DEFAULT_REGION,
        account: process.env.CDK_DEFAULT_ACCOUNT,
    },
    tags: { stage },
    stage,
    vpc: vpcStack.vpc,
});

const vpcLinkStack = new CdkVpcLinkStack(app, `cdk-vpc-link-${stage}`, {
    env: {
        region: process.env.CDK_DEFAULT_REGION,
        account: process.env.CDK_DEFAULT_ACCOUNT,
    },
    tags: { stage },
    stage,
    vpc: vpcStack.vpc,
});

new CdkApiGatewayStack(app, `cdk-api-gateway-${stage}`, {
    env: {
        region: process.env.CDK_DEFAULT_REGION,
        account: process.env.CDK_DEFAULT_ACCOUNT,
    },
    tags: { stage },
    stage,
    vpcLink: vpcLinkStack.vpcLink,
    albListener: albStack.listener,
});
