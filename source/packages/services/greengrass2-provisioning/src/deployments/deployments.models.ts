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
export interface NewDeployment {
	coreName: string;
}

export interface Deployment extends NewDeployment {
	taskId?: string,
	taskStatus: DeploymentTaskStatus;
	statusMessage?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export type DeploymentTaskStatus = 'Waiting' | 'InProgress' | 'Success' | 'Failure';

export const DeploymentTaskCreatedEvent = 'DeploymentTask Created Event'

export const DeploymentTaskDeletedEvent = 'DeploymentTask Deleted Event'

export type DeploymentTaskId = string;

export type DeploymentTaskCreatedPayload = {
	coreName: string,
	taskId: DeploymentTaskId,
	status: 'success' | 'failed'
	message?: string
}
