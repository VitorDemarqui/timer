import { Play } from 'phosphor-react'
import { useForm } from 'react-hook-form'
// serve para integrar o hookform com o zod
import { zodResolver } from '@hookform/resolvers/zod'
// usa quando nao tem export default na classe
import * as zod from 'zod'
import { useEffect, useState } from 'react'
import { differenceInSeconds } from 'date-fns'

import {
  CountDownContainer,
  FormContainer,
  HomeContainer,
  MinutesAmountInput,
  Separator,
  StartCountDownButton,
  TaskInput,
} from './styles'

// validando objeto
const newCycleFormValidationSchema = zod.object({
  task: zod.string().min(1, 'Informe a Tarefa!'),
  minutesAmount: zod
    .number()
    .min(5, 'O ciclo precisa de no mínimo 60 minutos')
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
}

// controlled - verifica informacoes em tempo real ex:disabilidar botao de submiti quando campo estiver vazio
// uncontrolled - nao verifica em tempo real ex:ao dar submit em um form ele chama funcao nao deixa finalizar
export function Home() {
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null)
  const [amountSecondPassed, setAmountSecondPassed] = useState(0)

  const { register, handleSubmit, watch, reset } = useForm<newCycleFormData>({
    resolver: zodResolver(newCycleFormValidationSchema),
    defaultValues: {
      task: '',
      minutesAmount: 0,
    },
  })
  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId)

  useEffect(() => {
    let interval: number
    if (activeCycle) {
      interval = setInterval(() => {
        setAmountSecondPassed(
          differenceInSeconds(new Date(), activeCycle.startDate),
        )
      }, 1000)
    }

    return () => {
      clearInterval(interval)
    }
  })

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

  const totalSeconds = activeCycle ? activeCycle.minutesAmount * 60 : 0
  const currentSeconds = activeCycle ? totalSeconds - amountSecondPassed : 0

  const minuteAmount = Math.floor(currentSeconds / 60)
  const secondsAmount = currentSeconds % 60

  const seconds = String(secondsAmount).padStart(2, '0')
  const minutes = String(minuteAmount).padStart(2, '0')

  useEffect(() => {
    if (activeCycle) {
      document.title = `${minutes} : ${seconds}`
    }
  }, [minutes, seconds])

  const task = watch('task')
  const isSubmitDisabled = !task

  return (
    <HomeContainer>
      <form onSubmit={handleSubmit(handleCreateNewCycle)} action="">
        <FormContainer>
          <label htmlFor="">Vou trabalhar em</label>
          <TaskInput
            id="task"
            list="task-suggestions"
            placeholder="Dê um nome para o seu projeto"
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
            min={5}
            max={60}
            {...register('minutesAmount', { valueAsNumber: true })}
          />

          <span>minutos.</span>
        </FormContainer>

        <CountDownContainer>
          <span>{minutes[0]}</span>
          <span>{minutes[1]}</span>
          <Separator>:</Separator>
          <span>{seconds[0]}</span>
          <span>{seconds[1]}</span>
        </CountDownContainer>

        <StartCountDownButton disabled={isSubmitDisabled} type="submit">
          <Play size={24} />
          Começar
        </StartCountDownButton>
      </form>
    </HomeContainer>
  )
}
