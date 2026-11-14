import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/tasksApi'
import { TaskForm } from './TaskForm'

const campos = () => ({
  titulo: screen.getByLabelText('Título'),
  responsable: screen.getByLabelText('Responsable'),
  enviar: screen.getByRole('button', { name: 'Crear tarea' }),
})

describe('TaskForm', () => {
  it('vacío: muestra un error por campo, pone el foco en el primero y NO llama a la API', async () => {
    const onCreate = vi.fn()
    render(<TaskForm onCreate={onCreate} />)
    const user = userEvent.setup()

    await user.click(campos().enviar)

    expect(screen.getByText('El título es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('El responsable es obligatorio')).toBeInTheDocument()
    expect(campos().titulo).toHaveAttribute('aria-invalid', 'true')
    expect(campos().titulo).toHaveFocus()
    expect(onCreate).not.toHaveBeenCalled()
  })

  it('válido: envía los textos recortados, vacía los campos y devuelve el foco al título', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined)
    render(<TaskForm onCreate={onCreate} />)
    const user = userEvent.setup()

    await user.type(campos().titulo, '  Comprar pan  ')
    await user.type(campos().responsable, ' Luis ')
    await user.click(campos().enviar)

    expect(onCreate).toHaveBeenCalledExactlyOnceWith({ title: 'Comprar pan', assignee: 'Luis' })
    await waitFor(() => expect(campos().titulo).toHaveValue(''))
    expect(campos().responsable).toHaveValue('')
    expect(campos().titulo).toHaveFocus()
  })

  it('si la API devuelve 400 con detalles, cada mensaje sale bajo SU campo y se conserva lo escrito', async () => {
    const rechazo = new ApiError(400, 'Datos inválidos', [{ field: 'assignee', message: 'El responsable ya no es válido' }])
    render(<TaskForm onCreate={vi.fn().mockRejectedValue(rechazo)} />)
    const user = userEvent.setup()

    await user.type(campos().titulo, 'Tarea')
    await user.type(campos().responsable, 'Luis')
    await user.click(campos().enviar)

    expect(await screen.findByText('El responsable ya no es válido')).toBeInTheDocument()
    expect(campos().responsable).toHaveAttribute('aria-invalid', 'true')
    expect(campos().titulo).toHaveAttribute('aria-invalid', 'false')
    expect(campos().responsable).toHaveFocus()
    expect(campos().titulo).toHaveValue('Tarea') // no se pierde lo escrito
  })

  it('un fallo general (servidor caído) se muestra como alerta del formulario y conserva lo escrito', async () => {
    const caido = new ApiError(0, 'No se pudo conectar con el servidor')
    render(<TaskForm onCreate={vi.fn().mockRejectedValue(caido)} />)
    const user = userEvent.setup()

    await user.type(campos().titulo, 'Tarea')
    await user.type(campos().responsable, 'Luis')
    await user.click(campos().enviar)

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar con el servidor')
    expect(campos().titulo).toHaveValue('Tarea')
    expect(campos().enviar).toBeEnabled()
  })

  it('al escribir en un campo con error, ese error desaparece', async () => {
    render(<TaskForm onCreate={vi.fn()} />)
    const user = userEvent.setup()

    await user.click(campos().enviar)
    expect(screen.getByText('El título es obligatorio')).toBeInTheDocument()

    await user.type(campos().titulo, 'A')

    expect(screen.queryByText('El título es obligatorio')).not.toBeInTheDocument()
    expect(screen.getByText('El responsable es obligatorio')).toBeInTheDocument() // el otro sigue
  })

  it('mientras envía, el botón dice «Creando…» y queda desactivado (sin doble envío)', async () => {
    let terminar!: () => void
    const onCreate = vi.fn(() => new Promise<void>((res) => (terminar = res)))
    render(<TaskForm onCreate={onCreate} />)
    const user = userEvent.setup()

    await user.type(campos().titulo, 'Tarea')
    await user.type(campos().responsable, 'Luis')
    await user.click(campos().enviar)

    const enCurso = screen.getByRole('button', { name: 'Creando…' })
    expect(enCurso).toBeDisabled()

    terminar()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Crear tarea' })).toBeEnabled())
  })
})
