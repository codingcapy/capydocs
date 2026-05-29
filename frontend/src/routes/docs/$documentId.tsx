import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/docs/$documentId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/docs/$documentId"!</div>
}
