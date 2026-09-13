interface ConfirmOptions {
  title?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

interface ConfirmState {
  open: boolean
  message: string
  title: string
  confirmText: string
  cancelText: string
  danger: boolean
}

const state = reactive<ConfirmState>({
  open: false,
  message: '',
  title: 'Are you sure?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  danger: false
})

let resolver: ((value: boolean) => void) | null = null

export function useConfirmModalState() {
  return state
}

export function resolveConfirmModal(value: boolean) {
  state.open = false
  resolver?.(value)
  resolver = null
}

export function useConfirm() {
  return function confirm(message: string, options: ConfirmOptions = {}): Promise<boolean> {
    state.message = message
    state.title = options.title ?? 'Are you sure?'
    state.confirmText = options.confirmText ?? 'Confirm'
    state.cancelText = options.cancelText ?? 'Cancel'
    state.danger = options.danger ?? true
    state.open = true
    return new Promise((resolve) => {
      resolver = resolve
    })
  }
}
