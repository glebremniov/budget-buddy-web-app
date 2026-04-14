import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/transactions/')({
  validateSearch: (search: Record<string, unknown>) => ({
    // Previous parameters were add/edit, now they are no longer used for routing to the modal
  }),
})
