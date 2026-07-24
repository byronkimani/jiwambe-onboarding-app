import { ShellPlaceholder } from "@/components/layout/shell-placeholder";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function HomePage() {
  return (
    <ShellPlaceholder
      variant="login"
      title="Onboarding desk"
      description="Sign in with your agent phone number and password. After login you land on the desk queue."
    >
      <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div>
          <Label className="text-white/80">Phone number</Label>
          <Input
            className="mt-2 border-none bg-white/90"
            placeholder="07XX XXX XXX"
            inputMode="tel"
            disabled
            aria-label="Phone number"
          />
        </div>
        <div>
          <Label className="text-white/80">Password</Label>
          <Input
            className="mt-2 border-none bg-white/90"
            type="password"
            disabled
            aria-label="Password"
          />
        </div>
      </div>
    </ShellPlaceholder>
  );
}
