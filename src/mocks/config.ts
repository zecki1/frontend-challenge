import { resolveScenario, type MockScenario } from './scenarios'

/**
 * Configuração de runtime dos mocks. Os handlers leem daqui para aplicar
 * latência, falhas e comportamentos de negócio alternativos.
 */
let activeScenarioName = 'default'
let activeScenario: MockScenario = resolveScenario('default')

export const mockConfig = {
  get scenarioName(): string {
    return activeScenarioName
  },
  get scenario(): MockScenario {
    return activeScenario
  },
  setScenario(name: string): MockScenario {
    activeScenarioName = name
    activeScenario = resolveScenario(name)
    return activeScenario
  },
  patch(partial: Partial<MockScenario>): MockScenario {
    activeScenario = { ...activeScenario, ...partial }
    return activeScenario
  },
}

export function scenario(): MockScenario {
  return activeScenario
}
