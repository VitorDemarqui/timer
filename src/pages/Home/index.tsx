import { HandPalm, Play } from 'phosphor-react'
import { FormProvider, useForm } from 'react-hook-form'
// serve para integrar o hookform com o zod
import { zodResolver } from '@hookform/resolvers/zod'
// usa quando nao tem export default na classe
import * as zod from 'zod'
import { createContext, useState } from 'react'

import { NewCycleForm } from './components/NewCycleForm'
import { Countdown } from './components/Countdown'

import {
  HomeContainer,
  StartCountDownButton,
  StopCountDownButton,
} from './styles'

// validando objeto
const newCycleFormValidationSchema = zod.object({
  task: zod.string().min(1, 'Informe a Tarefa!'),
  minutesAmount: zod
    .number()
    .min(1, 'O ciclo precisa de no mínimo 60 minutos')
    .max(60, 'O ciclo precisa de no máximo 60 minutos'),
})

// interface ao criar objetos a partir de nada
// interface newCycleFormData {
//   task: string
//   minutesAmount: number
// }

// usar type quando for criar objeto a partir de outro
// type of convert objeto java script em objeto type script
type newCycleFormData = zod.infer<typeof newCycleFormValidationSchema>

interface Cycle {
  id: string
  task: string
  minutesAmount: number
  startDate: Date
  interruptDate?: Date
  finishedDate?: Date
}

interface CyclesContextType {
  activeCycle: Cycle | undefined
  activeCycleId: string | null
  amountSecondPassed: number
  markCurrentCycleAsFinished: () => void
  setSecondsPassed: (seconds: number) => void
}

export const CyclesContext = createContext({} as CyclesContextType)

// controlled - verifica informacoes em tempo real ex:disabilidar botao de submiti quando campo estiver vazio
// uncontrolled - nao verifica em tempo real ex:ao dar submit em um form ele chama funcao nao deixa finalizar
export function Home() {
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)
  const [amountSecondPassed, setAmountSecondPassed] = useState(0)

  const newCycleForm = useForm<newCycleFormData>({
    resolver: zodResolver(newCycleFormValidationSchema),
    defaultValues: {
      task: '',
      minutesAmount: 0,
    },
  })

  const { handleSubmit, watch, reset } = newCycleForm

  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  function setSecondsPassed(seconds: number) {
    setAmountSecondPassed(seconds)
  }

  function markCurrentCycleAsFinished() {
    setCycles((state) =>
      state.map((cycle) => {
        if (cycle.id === activeCycleId) {
          return { ...cycle, finishedDate: new Date() }
        } else {
          return cycle
        }
      }),
    )
  }

  function handleCreateNewCycle(data: newCycleFormData) {
    const newCycle: Cycle = {
      id: String(new Date().getTime()),
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    }

    setCycles((state) => [...state, newCycle])
    setActiveCycleId(newCycle.id)
    setAmountSecondPassed(0)

    // volta para os campos setados no default values
    reset()
  }

  const task = watch('task')
  const isSubmitDisabled = !task

  function handleInterruptCycle() {
    setCycles((state) =>
      state.map((cycle) => {
        if (cycle.id === activeCycleId) {
          return { ...cycle, interruptDate: new Date() }
        } else {
          return cycle
        }
      }),
    )

    setActiveCycleId(null)
  }

  return (
    <HomeContainer>
      <CyclesContext.Provider
        value={{
          activeCycle,
          activeCycleId,
          markCurrentCycleAsFinished,
          amountSecondPassed,
          setSecondsPassed,
        }}
      >
        {/* passa todas propriedades de newCycleForm para o newCycleForm */}
        <FormProvider {...newCycleForm}>
          <NewCycleForm />
        </FormProvider>
        <Countdown />
      </CyclesContext.Provider>

      <form onSubmit={handleSubmit(handleCreateNewCycle)} action="">
        {activeCycle ? (
          <StopCountDownButton onClick={handleInterruptCycle} type="button">
            <HandPalm size={24} />
            Terminar
          </StopCountDownButton>
        ) : (
          <StartCountDownButton disabled={isSubmitDisabled} type="submit">
            <Play size={24} />
            Começar
          </StartCountDownButton>
        )}
      </form>
    </HomeContainer>
  )
}
