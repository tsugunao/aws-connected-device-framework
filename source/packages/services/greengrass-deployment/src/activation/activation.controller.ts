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
import { Response } from 'express';
import { inject } from 'inversify';
import { interfaces, controller, response, requestBody, requestParam, httpPost, httpGet, httpDelete } from 'inversify-express-utils';

import { handleError } from '../utils/errors';
import { logger } from '../utils/logger';

import { TYPES } from '../di/types';
import { ActivationService } from './activation.service';
import { ActivationAssembler } from './activation.assember';
import { ActivationItem, ActivationResource } from './activation.model';

@controller('/devices')
export class ActivationController implements interfaces.Controller {

    public constructor(
        @inject(TYPES.ActivationService) private activationService: ActivationService,
        @inject(TYPES.ActivationAssembler) private activationAssembler: ActivationAssembler
    ) {}

    @httpPost('/:deviceId/activations')
    public async createActivation(
        @requestBody() activation: ActivationResource,
        @response() res: Response
    ) : Promise<ActivationResource> {

        logger.info(`Activation.controller createActivation: in: item:${JSON.stringify(activation)}`);

        let resource: ActivationResource

        try {
            let item = this.activationAssembler.fromResource(activation);
            item = await this.activationService.createActivation(item);
            resource = this.activationAssembler.toResource(item)
        } catch (err) {
            handleError(err, res);
        }

        logger.debug(`Activation.controller createActivation: exit:`);

        return resource;
    }

    @httpGet('/:deviceId/activations/:activationId')
    public async getActivation(
        @response() res: Response,
        @requestParam('deviceId') deviceId: string,
        @requestParam('activationId') activationId: string
    ): Promise<ActivationItem> {
        logger.debug(`Deployment.controller getDeployment: in: deviceId: ${deviceId}`);

        let activation: ActivationItem;

        try {
            activation = await this.activationService.getActivation(activationId, deviceId);
        } catch (err) {
            handleError(err, res);
        }

        logger.debug(`Deployment.controller getDeployment: exit: ${JSON.stringify(activation)}`);

        return activation;
    }

    @httpDelete('/:deviceId/activations/:activationId')
    public async deleteActivation(
        @response() res: Response,
        @requestParam('deviceId') deviceId: string,
        @requestParam('activationId') activationId: string
    ): Promise<void> {
        logger.debug(`Deployment.controller getDeployment: in: deviceId: ${deviceId}`);

        try {
            await this.activationService.deleteActivation(activationId, deviceId);
        } catch (err) {
            handleError(err, res);
        }

        logger.debug(`Deployment.controller getDeployment: exit:`);
    }
}
