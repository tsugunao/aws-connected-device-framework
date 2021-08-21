#-----------------------------------------------------------------------------------------------------------------------
#   Copyright Amazon.com Inc. or its affiliates. All Rights Reserved.
#
#  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
#  with the License. A copy of the License is located at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
#  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
#  and limitations under the License.
#-----------------------------------------------------------------------------------------------------------------------

Feature: Group lifecycle

  @setup_groups_lite_feature
  Scenario: Setup
    Given group "TEST-groups-group001" does not exist

  Scenario: Create a group with valid attributes
    Given group "TEST-groups-group001" does not exist
    When I create group "TEST-groups-group001" of "" with attributes
      | description | Mygroup |
      | attributes | {"color":"black","size":"S"} |
    Then group "TEST-groups-group001" exists with attributes
      | name | TEST-groups-group001 |
      | description | Mygroup |
      | attributes |  {"color":"black","size":"S"} |

  Scenario: Update existing groups attributes
    Given group "TEST-groups-group001" exists
    When I update group "TEST-groups-group001" with attributes
      | attributes | {"size":"M"} |
    Then group "TEST-groups-group001" exists with attributes
      | name | TEST-groups-group001 |
      | description | Mygroup |
      | attributes | {"color":"black","size":"M"} |

  Scenario: Group paths are unique
    Given group "TEST-groups-group001" exists
    When I create group "TEST-groups-group001" of "" with attributes
      | attributes | {"color":"black","size":"S"} |
    Then it fails with a 409


  Scenario: Retrieving a group that does not exist
    Given group "TEST-groups-groupXXX" does not exist
    When I get group "TEST-groups-groupXXX"
    Then it fails with a 404


  Scenario: Delete the group
    Given group "TEST-groups-group001" exists
    When I delete group "TEST-groups-group001"
    Then group "TEST-groups-group001" does not exist


  @teardown_groups_lite_feature
  Scenario: Teardown
    Given group "TEST-groups-group001" does not exist
