import { defineParameterType } from '@cucumber/cucumber'

defineParameterType({
  name: 'matchResult',
  regexp: /win|loss/,
  transformer: (value: string): boolean => value === 'win',
})

defineParameterType({
  name: 'sortOrder',
  regexp: /ascending|descending/,
  transformer: (value: string): 'asc' | 'desc' =>
    value === 'ascending' ? 'asc' : 'desc',
})
