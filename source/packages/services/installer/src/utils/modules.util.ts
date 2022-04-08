import { Modules } from "../models/answers";
import { ModuleName } from "../models/modules";

const includeOptionalModule = (moduleName: ModuleName, { list, expandedMandatory }: Modules, conditionToCheck: boolean): void => {
    if (conditionToCheck && !list.includes(moduleName) && !expandedMandatory.includes(moduleName)) {
        expandedMandatory.push(moduleName)
    }
}

export {
    includeOptionalModule
}