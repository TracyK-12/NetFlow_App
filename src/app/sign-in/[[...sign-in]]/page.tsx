import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100">
      <SignIn />
    </div>
  );
}
