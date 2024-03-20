import { useContext } from 'react'
import { FormContainer, MinutesAmountInput, TaskInput } from './styles'
import { CyclesContext } from '../..'
import { useFormContext } from 'react-hook-form'

export function NewCycleForm() {
  const { activeCycle } = useContext(CyclesContext)
  const { register } = useFormContext()

  return (
    <FormContainer>
      <label htmlFor="">Vou trabalhar em</label>
      <TaskInput
        id="task"
        list="task-suggestions"
        placeholder="Dê um nome para o seu projeto"
        //! ! converte o valor pra boolean, caso tenha algo ele desabilita
        disabled={!!activeCycle}
        // insere o name tambem
        // register possui atributos de campo, ... retorna todos os metodos
        {...register('task')}
      />

      <datalist id="task-suggestions">
        <option value="Projetinho fellas" />
        <option value="Projetinho 2 fellas" />
        <option value="Seh loro" />
      </datalist>

      <label>durante</label>
      <MinutesAmountInput
        type="number"
        id="minutesAmount"
        placeholder="00"
        step={5}
        min={1}
        max={60}
        disabled={!!activeCycle}
        {...register('minutesAmount', { valueAsNumber: true })}
      />

      <span>minutos.</span>
    </FormContainer>
  )
}
