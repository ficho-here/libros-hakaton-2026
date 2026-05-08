import UserAccount from "@/components/UserAccount";

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-arena">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-8 sm:px-8">
        <div className="motion-fade-up border-l-4 border-neon pl-4">
          <p className="text-sm font-black uppercase tracking-wide text-[#9aa6ad]">Profile</p>
          <h1 className="mt-2 text-4xl font-black text-white">User Account</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Manage your connected wallet, username, and recent voting activity.
          </p>
        </div>

        <UserAccount />
      </div>
    </main>
  );
}
