import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <div>Sign up</div>
      <form action="">
        <input type="text" />
        <input type="text" />
        <button>SIGN UP</button>
      </form>
      <div>
        Already have an account? <Link to="/">Log in</Link>
      </div>
    </div>
  );
}
