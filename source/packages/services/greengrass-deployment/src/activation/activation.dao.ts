/*********************************************************************************************************************
 *  Copyright Amazon.com Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance    *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://www.apache.org/licenses/LICENSE-2.0                                                                    *
 *                                                                                                                    *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/
import AWS = require('aws-sdk');
import {inject, injectable} from 'inversify';

import {logger} from '../utils/logger';
import {TYPES} from '../di/types';
import {createDelimitedAttribute, PkType} from '../utils/pKUtils.util';

import {ActivationItemList, ActivationItem } from './activation.model';

@injectable()
export class ActivationDao {

    private dc: AWS.DynamoDB.DocumentClient;
    private readonly SI1_INDEX = 'sk-si1Sort-index';
    private readonly SI2_INDEX = 'si2Hash-sk-index';

    constructor(
        @inject('aws.dynamoDB.ggProvisioningTable') private provisioningTable: string,
        @inject(TYPES.DocumentClientFactory) documentClientFactory: () => AWS.DynamoDB.DocumentClient
    ) {
        this.dc = documentClientFactory();
    }

    public async isDeviceWhitelisted(deviceId: string): Promise<boolean> {
        logger.debug(`activation.dao: white list: in ${deviceId}`);

        const params = {
            TableName: this.provisioningTable,
            IndexName: this.SI2_INDEX,
            KeyConditionExpression: `#pk=:pk AND #sk=:sk`,
            ExpressionAttributeNames: {
                '#pk': 'si2Hash',
                '#sk': 'sk'
            },
            ExpressionAttributeValues: {
                ':pk': createDelimitedAttribute(PkType.GreengrassDevice, deviceId),
                ':sk': createDelimitedAttribute(PkType.GreengrassDevice, deviceId)
            }
        };

        const result = await this.dc.query(params).promise();
        if (result.Items===undefined || result.Items.length===0) {
            logger.debug('activations=.dao get: exit: undefined');
            return false;
        }

        return true;
    }

    public async save(activation: ActivationItem): Promise<void> {
        logger.debug(`activation.dao: save: in: activation: ${JSON.stringify(activation)}`);

        const params = {
            TableName: this.provisioningTable,
            Item: {
                pk: createDelimitedAttribute(PkType.DeviceActivation, activation.activationId),
                sk:  createDelimitedAttribute(PkType.GreengrassDevice, activation.deviceId),
                si1Sort: createDelimitedAttribute(PkType.DeviceActivation, activation.activationId),
                createdAt: activation.createdAt?.toISOString(),
                updatedAt: activation.updatedAt?.toISOString()
            }
        };

        await this.dc.put(params).promise();

        logger.debug(`activation.dao: save: exit: `);
    }

    public async update(activation: ActivationItem): Promise<void> {
        logger.debug(`activation.dao: save: in: activation: ${JSON.stringify(activation)}`);

        const params = {
            TableName: this.provisioningTable,
            Item: {
                pk: createDelimitedAttribute(PkType.DeviceActivation, activation.activationId),
                sk:  createDelimitedAttribute(PkType.GreengrassDevice, activation.deviceId),
                si1Sort: createDelimitedAttribute(PkType.GreengrassDevice, activation.activationId),
                createdAt: activation.createdAt?.toISOString(),
                updatedAt: activation.updatedAt?.toISOString()
            }
        };

        await this.dc.put(params).promise();

        logger.debug(`activation.dao: save: exit: `);
    }

    public async delete(activationId: string, deviceId: string): Promise<void> {
        logger.debug(`activation.dao delete: in: activationId:${activationId}`);

        const params = {
            TableName: this.provisioningTable,
            Key: {
                pk: createDelimitedAttribute(PkType.DeviceActivation, activationId),
                sk: createDelimitedAttribute(PkType.GreengrassDevice, deviceId),
            }
        };

        await this.dc.delete(params).promise();

        logger.debug(`activation.dao delete: exit:`);
    }

    public async get(activationId: string, deviceId: string): Promise<ActivationItem> {
        logger.debug(`activation.dao: get: in: deviceId: ${deviceId}, activationId: ${activationId}`);

        const params = {
            TableName: this.provisioningTable,
            KeyConditionExpression: `#pk=:pk AND #sk=:sk`,
            ExpressionAttributeNames: {
                '#pk': 'pk',
                '#sk': 'sk'
            },
            ExpressionAttributeValues: {
                ':pk': createDelimitedAttribute(PkType.DeviceActivation, activationId),
                ':sk': createDelimitedAttribute(PkType.GreengrassDevice, deviceId)
            }
        };

        const result = await this.dc.query(params).promise();
        if (result.Items===undefined || result.Items.length===0) {
            logger.debug('activations=.dao get: exit: undefined');
            return undefined;
        }

        const activationList = this.assemble(result.Items);

        logger.debug(`activation.dao: get: exit: activationList: ${JSON.stringify(activationList)}`);

        return activationList.activations[0];
    }

    public async getByDeviceId(deviceId: string): Promise<ActivationItem> {
        logger.debug(`activation.dao: getByDeviceId: in: deviceId: ${deviceId}`);

        const params = {
            TableName: this.provisioningTable,
            IndexName: this.SI1_INDEX,
            KeyConditionExpression: `#pk=:pk AND begins_with(#sk,:sk)`,
            ExpressionAttributeNames: {
                '#pk': 'sk',
                '#sk': 'si1Sort'
            },
            ExpressionAttributeValues: {
                ':pk': createDelimitedAttribute(PkType.GreengrassDevice, deviceId),
                ':sk': createDelimitedAttribute(PkType.DeviceActivation)
            }
        };

        const result = await this.dc.query(params).promise();
        if (result.Items===undefined || result.Items.length===0) {
            logger.debug('activations=.dao getByDeviceId: exit: undefined');
            return undefined;
        }

        const activationList = this.assemble(result.Items);

        logger.debug(`activation.dao: getByDeviceId: exit: activationList: ${JSON.stringify(activationList)}`);

        return activationList.activations[0];
    }

    private assemble(items: AWS.DynamoDB.DocumentClient.ItemList): ActivationItemList {
        const list = new ActivationItemList();

        for(const i of items) {

            const pkElements = i.pk.split(':');
            const skElements = i.sk.split(':');

            const activation: ActivationItem = {
                deviceId: skElements[1],
                activationId: pkElements[1],
                createdAt: new Date(i.createdAt),
                updatedAt: new Date(i.updatedAt)
            };

            list.activations.push(activation);
        }
        return list;
    }

}
