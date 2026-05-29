import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/home")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <div>CapyDocs</div>
      <div>Write content and collaborate with others</div>
      <div>Login</div>
      <form action="">
        <input type="text" />
        <input type="text" />
        <button>LOG IN</button>
      </form>
      <div>
        Don't an account? <Link to="/">Sign up</Link>
      </div>
    </div>
  );
}
